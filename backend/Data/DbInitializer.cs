using DevTask.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTask.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(DevTaskDbContext dbContext)
    {
        await dbContext.Database.EnsureCreatedAsync();
        await dbContext.Database.ExecuteSqlRawAsync("CREATE TABLE IF NOT EXISTS Users (Id INTEGER NOT NULL CONSTRAINT PK_Users PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Email TEXT NOT NULL, PasswordHash TEXT NOT NULL, CreatedAt TEXT NOT NULL)");
        await dbContext.Database.ExecuteSqlRawAsync("CREATE UNIQUE INDEX IF NOT EXISTS IX_Users_Email ON Users (Email)");
        if (await dbContext.Tasks.AnyAsync())
        {
            return;
        }

        var createdAt = DateTime.UtcNow;
        dbContext.Tasks.AddRange(
            new TaskItem { Title = "Build portfolio website", Description = "Create a polished project showcase with case studies.", Priority = TaskPriority.High, CreatedAt = createdAt, DueDate = createdAt.AddDays(7) },
            new TaskItem { Title = "Practice C# fundamentals", Description = "Review collections, LINQ, and async programming.", Priority = TaskPriority.Medium, CreatedAt = createdAt.AddMinutes(-5), DueDate = createdAt.AddDays(3) },
            new TaskItem { Title = "Review Git commands", Description = "Practice branching, rebasing, and writing useful commits.", Priority = TaskPriority.Low, CreatedAt = createdAt.AddMinutes(-10) },
            new TaskItem { Title = "Complete ASP.NET API", Description = "Finish the task manager endpoints and API documentation.", Priority = TaskPriority.High, CreatedAt = createdAt.AddMinutes(-15), DueDate = createdAt.AddDays(2) },
            new TaskItem { Title = "Solve algorithm problems", Description = "Work through arrays, strings, and graph exercises.", Priority = TaskPriority.Medium, CreatedAt = createdAt.AddMinutes(-20), DueDate = createdAt.AddDays(5) }
        );
        await dbContext.SaveChangesAsync();
    }
}
