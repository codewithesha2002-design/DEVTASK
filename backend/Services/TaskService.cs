using DevTask.Api.Data;
using DevTask.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTask.Api.Services;

public class TaskService(DevTaskDbContext dbContext) : ITaskService
{
    public async Task<IReadOnlyList<TaskItem>> GetAllAsync() =>
        await dbContext.Tasks.AsNoTracking().OrderBy(task => task.IsCompleted).ThenBy(task => task.DueDate).ThenByDescending(task => task.CreatedAt).ToListAsync();

    public Task<TaskItem?> GetByIdAsync(int id) => dbContext.Tasks.AsNoTracking().FirstOrDefaultAsync(task => task.Id == id);

    public async Task<TaskItem> CreateAsync(CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow
        };
        dbContext.Tasks.Add(task);
        await dbContext.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem?> UpdateAsync(int id, UpdateTaskRequest request)
    {
        var task = await dbContext.Tasks.FindAsync(id);
        if (task is null) return null;

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim() ?? string.Empty;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;
        await dbContext.SaveChangesAsync();
        return task;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await dbContext.Tasks.FindAsync(id);
        if (task is null) return false;
        dbContext.Tasks.Remove(task);
        await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<TaskItem?> CompleteAsync(int id)
    {
        var task = await dbContext.Tasks.FindAsync(id);
        if (task is null) return null;
        task.IsCompleted = !task.IsCompleted;
        task.CompletedAt = task.IsCompleted ? DateTime.UtcNow : null;
        await dbContext.SaveChangesAsync();
        return task;
    }
}
