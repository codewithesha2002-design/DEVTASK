using System.ComponentModel.DataAnnotations;

namespace DevTask.Api.Models;

public class CreateTaskRequest
{
    [Required, StringLength(120, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    [EnumDataType(typeof(TaskPriority))]
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }
}

public class UpdateTaskRequest : CreateTaskRequest
{
}
