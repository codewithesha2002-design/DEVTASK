using DevTask.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTask.Api.Data;

public class DevTaskDbContext(DbContextOptions<DevTaskDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>().Property(task => task.Priority).HasConversion<string>();
        modelBuilder.Entity<TaskItem>().Property(task => task.Title).HasMaxLength(120).IsRequired();
        modelBuilder.Entity<TaskItem>().Property(task => task.Description).HasMaxLength(1000);
    }
}
