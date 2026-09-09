using DevTask.Api.Models;
using DevTask.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevTask.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskItem>>> GetAll() => Ok(await taskService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> GetById(int id)
    {
        var task = await taskService.GetByIdAsync(id);
        return task is null ? NotFound(new { message = "Task not found." }) : Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create(CreateTaskRequest request)
    {
        var task = await taskService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskItem>> Update(int id, UpdateTaskRequest request)
    {
        var task = await taskService.UpdateAsync(id, request);
        return task is null ? NotFound(new { message = "Task not found." }) : Ok(task);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await taskService.DeleteAsync(id) ? NoContent() : NotFound(new { message = "Task not found." });

    [HttpPatch("{id:int}/complete")]
    public async Task<ActionResult<TaskItem>> Complete(int id)
    {
        var task = await taskService.CompleteAsync(id);
        return task is null ? NotFound(new { message = "Task not found." }) : Ok(task);
    }
}
