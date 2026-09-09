import './style.css';
import { tasksApi } from './api/tasksApi';
import type { Task, TaskInput, TaskPriority } from './types/task';
import { formatDate, formatShortDate, toDateInputValue } from './utils/format';

const app = document.querySelector<HTMLDivElement>('#app')!;
let tasks: Task[] = [];
let activeStatus = 'all';
let activePriority = 'all';
let searchTerm = '';
let editingTask: Task | null = null;

app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="#" aria-label="DevTask home"><span class="brand-mark">D</span><span>DevTask</span></a>
      <nav aria-label="Primary navigation">
        <a class="nav-link active" href="#tasks"><span class="nav-icon">▦</span>My tasks</a>
        <a class="nav-link" href="#overview"><span class="nav-icon">◴</span>Overview</a>
      </nav>
      <div class="sidebar-note"><span class="status-dot"></span><div><strong>API connected</strong><small>Local workspace</small></div></div>
      <div class="sidebar-footer">Build with intention.<br><span>v1.0.0</span></div>
    </aside>
    <main class="main-content">
      <header class="topbar"><div class="breadcrumb">Workspace <span>/</span> My tasks</div><div class="avatar" aria-label="Esha's profile">E</div></header>
      <div class="content-wrap">
        <section class="welcome" id="overview"><div><p class="eyebrow">Tuesday, your focus starts here</p><h1>Organize your work.<br><em>Ship faster.</em></h1><p class="subheading">A clear view of the details that move your next release forward.</p></div><button class="primary-button" id="add-task-button"><span>+</span> Add task</button></section>
        <section class="stats-grid" id="stats" aria-label="Task summary"></section>
        <section class="task-section" id="tasks">
          <div class="section-heading"><div><h2>All tasks</h2><p id="task-count">Loading your workspace...</p></div><div class="view-toggle" aria-label="View options"><button class="view-button active" aria-label="List view">☷</button><button class="view-button" aria-label="Grid view">⊞</button></div></div>
          <div class="toolbar"><label class="search-box"><span>⌕</span><input id="search-input" type="search" placeholder="Search tasks..." aria-label="Search tasks" /></label><div class="filter-row"><div class="segmented" id="status-filters" role="group" aria-label="Filter by status"><button class="selected" data-status="all">All</button><button data-status="active">Active</button><button data-status="completed">Completed</button></div><label class="priority-select"><span class="sr-only">Filter by priority</span><select id="priority-filter"><option value="all">All priorities</option><option value="High">High priority</option><option value="Medium">Medium priority</option><option value="Low">Low priority</option></select></label></div></div>
          <div id="task-list" aria-live="polite"></div>
        </section>
      </div>
    </main>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <div class="modal-backdrop" id="modal" hidden><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="close-button" id="close-modal" aria-label="Close dialog">×</button><p class="eyebrow">Task details</p><h2 id="modal-title">Add a new task</h2><form id="task-form"><label>Title<input name="title" id="task-title" required maxlength="120" placeholder="e.g. Refactor authentication flow" /></label><label>Description<textarea name="description" maxlength="1000" rows="3" placeholder="What needs to be done?"></textarea></label><div class="form-row"><label>Priority<select name="priority"><option value="High">High</option><option value="Medium" selected>Medium</option><option value="Low">Low</option></select></label><label>Due date<input name="dueDate" type="date" /></label></div><p class="form-error" id="form-error" role="alert"></p><div class="modal-actions"><button type="button" class="secondary-button" id="cancel-modal">Cancel</button><button class="primary-button" id="save-task" type="submit">Save task</button></div></form></section></div>
`;

const taskList = document.querySelector<HTMLDivElement>('#task-list')!;
const stats = document.querySelector<HTMLElement>('#stats')!;
const modal = document.querySelector<HTMLDivElement>('#modal')!;
const form = document.querySelector<HTMLFormElement>('#task-form')!;
const toast = document.querySelector<HTMLDivElement>('#toast')!;
const titleInput = document.querySelector<HTMLInputElement>('#task-title')!;

function showToast(message: string, isError = false) {
  toast.textContent = message;
  toast.className = `toast visible ${isError ? 'error' : ''}`;
  window.setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function filteredTasks() {
  return tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === 'all' || (activeStatus === 'completed' ? task.isCompleted : !task.isCompleted);
    const matchesPriority = activePriority === 'all' || task.priority === activePriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function renderStats() {
  const completed = tasks.filter((task) => task.isCompleted).length;
  const high = tasks.filter((task) => task.priority === 'High' && !task.isCompleted).length;
  const statsData = [
    { label: 'Total tasks', value: tasks.length, detail: 'Across this workspace', icon: '▦', color: 'blue' },
    { label: 'Completed', value: completed, detail: `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}% of all tasks`, icon: '✓', color: 'green' },
    { label: 'Pending', value: tasks.length - completed, detail: 'Keep the momentum going', icon: '◷', color: 'amber' },
    { label: 'High priority', value: high, detail: 'Needs your attention', icon: '!', color: 'coral' },
  ];
  stats.innerHTML = statsData.map((item) => `<article class="stat-card"><div class="stat-icon ${item.color}">${item.icon}</div><div><p>${item.label}</p><strong>${item.value}</strong><small>${item.detail}</small></div></article>`).join('');
}

function renderTasks() {
  const visibleTasks = filteredTasks();
  document.querySelector('#task-count')!.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'} in your workspace`;
  if (!visibleTasks.length) {
    taskList.innerHTML = `<div class="empty-state"><div class="empty-icon">⌁</div><h3>${tasks.length ? 'No matching tasks' : 'Your workspace is clear'}</h3><p>${tasks.length ? 'Try changing your search or filters.' : 'Add your first task and make progress visible.'}</p><button class="secondary-button" id="empty-add">${tasks.length ? 'Clear filters' : 'Add your first task'}</button></div>`;
    document.querySelector('#empty-add')?.addEventListener('click', () => tasks.length ? clearFilters() : openModal());
    return;
  }
  taskList.innerHTML = `<div class="task-list">${visibleTasks.map(renderTask).join('')}</div>`;
  taskList.querySelectorAll<HTMLButtonElement>('[data-action="complete"]').forEach((button) => button.addEventListener('click', () => toggleTask(Number(button.dataset.id))));
  taskList.querySelectorAll<HTMLButtonElement>('[data-action="edit"]').forEach((button) => button.addEventListener('click', () => openModal(tasks.find((task) => task.id === Number(button.dataset.id))!)));
  taskList.querySelectorAll<HTMLButtonElement>('[data-action="delete"]').forEach((button) => button.addEventListener('click', () => deleteTask(Number(button.dataset.id))));
}

function renderTask(task: Task) {
  const dueText = task.dueDate ? `Due ${formatShortDate(task.dueDate)}` : 'No due date';
  return `<article class="task-card ${task.isCompleted ? 'completed' : ''}"><button class="check-button ${task.isCompleted ? 'checked' : ''}" data-action="complete" data-id="${task.id}" aria-label="${task.isCompleted ? 'Mark incomplete' : 'Mark complete'}: ${task.title}">${task.isCompleted ? '✓' : ''}</button><div class="task-body"><div class="task-title-row"><h3>${escapeHtml(task.title)}</h3><span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span></div><p>${escapeHtml(task.description || 'No description added.')}</p><div class="task-meta"><span>◷ ${dueText}</span><span>Created ${formatDate(task.createdAt)}</span>${task.isCompleted ? '<span class="completed-label">✓ Completed</span>' : ''}</div></div><div class="task-actions"><button data-action="edit" data-id="${task.id}" aria-label="Edit ${escapeHtml(task.title)}">✎</button><button data-action="delete" data-id="${task.id}" aria-label="Delete ${escapeHtml(task.title)}">⌫</button></div></article>`;
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character] ?? character); }
function clearFilters() { searchTerm = ''; activeStatus = 'all'; activePriority = 'all'; document.querySelector<HTMLInputElement>('#search-input')!.value = ''; document.querySelector<HTMLSelectElement>('#priority-filter')!.value = 'all'; document.querySelectorAll('#status-filters button').forEach((button) => button.classList.toggle('selected', button.getAttribute('data-status') === 'all')); renderTasks(); }
function openModal(task: Task | null = null) { editingTask = task; modal.hidden = false; document.body.classList.add('modal-open'); document.querySelector('#modal-title')!.textContent = task ? 'Edit task' : 'Add a new task'; (form.elements.namedItem('title') as HTMLInputElement).value = task?.title ?? ''; (form.elements.namedItem('description') as HTMLTextAreaElement).value = task?.description ?? ''; (form.elements.namedItem('priority') as HTMLSelectElement).value = task?.priority ?? 'Medium'; (form.elements.namedItem('dueDate') as HTMLInputElement).value = toDateInputValue(task?.dueDate ?? null); document.querySelector('#form-error')!.textContent = ''; titleInput.focus(); }
function closeModal() { modal.hidden = true; document.body.classList.remove('modal-open'); editingTask = null; form.reset(); }
async function loadTasks() { taskList.innerHTML = '<div class="loading-state"><span class="spinner"></span>Loading tasks...</div>'; try { tasks = await tasksApi.list(); renderStats(); renderTasks(); } catch { taskList.innerHTML = '<div class="error-state"><h3>Could not load your tasks</h3><p>Unable to connect to the server. Please try again.</p><button class="secondary-button" id="retry">Retry</button></div>'; document.querySelector('#retry')?.addEventListener('click', loadTasks); } }
async function toggleTask(id: number) { try { const updated = await tasksApi.toggleComplete(id); tasks = tasks.map((task) => task.id === id ? updated : task); renderStats(); renderTasks(); showToast(updated.isCompleted ? 'Task marked as completed.' : 'Task moved back to active.'); } catch { showToast('Unable to update the task. Please try again.', true); } }
async function deleteTask(id: number) { const task = tasks.find((item) => item.id === id); if (!task || !window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return; try { await tasksApi.remove(id); tasks = tasks.filter((item) => item.id !== id); renderStats(); renderTasks(); showToast('Task deleted.'); } catch { showToast('Unable to delete the task. Please try again.', true); } }

form.addEventListener('submit', async (event) => { event.preventDefault(); const data = new FormData(form); const input: TaskInput = { title: String(data.get('title') ?? '').trim(), description: String(data.get('description') ?? '').trim(), priority: data.get('priority') as TaskPriority, dueDate: String(data.get('dueDate') ?? '') || null }; const error = document.querySelector('#form-error')!; if (!input.title) { error.textContent = 'Please add a title.'; titleInput.focus(); return; } const saveButton = document.querySelector<HTMLButtonElement>('#save-task')!; saveButton.disabled = true; saveButton.textContent = 'Saving...'; try { if (editingTask) { const updated = await tasksApi.update(editingTask.id, input); tasks = tasks.map((task) => task.id === updated.id ? updated : task); showToast('Task updated successfully.'); } else { const created = await tasksApi.create(input); tasks = [created, ...tasks]; showToast('Task created successfully.'); } closeModal(); renderStats(); renderTasks(); } catch { error.textContent = 'Unable to save the task. Please try again.'; } finally { saveButton.disabled = false; saveButton.textContent = 'Save task'; } });

document.querySelector('#add-task-button')!.addEventListener('click', () => openModal());
document.querySelector('#close-modal')!.addEventListener('click', closeModal);
document.querySelector('#cancel-modal')!.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
document.querySelector<HTMLInputElement>('#search-input')!.addEventListener('input', (event) => { searchTerm = (event.target as HTMLInputElement).value; renderTasks(); });
document.querySelector<HTMLSelectElement>('#priority-filter')!.addEventListener('change', (event) => { activePriority = (event.target as HTMLSelectElement).value; renderTasks(); });
document.querySelectorAll<HTMLButtonElement>('#status-filters button').forEach((button) => button.addEventListener('click', () => { activeStatus = button.dataset.status ?? 'all'; document.querySelectorAll('#status-filters button').forEach((item) => item.classList.toggle('selected', item === button)); renderTasks(); }));
loadTasks();
