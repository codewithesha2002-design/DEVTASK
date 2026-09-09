using DevTask.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevTask.Api.Data;

public class DevTaskDbContext(DbContextOptions<DevTaskDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>().Property(task => task.Priority).HasConversion<string>();
        modelBuilder.Entity<TaskItem>().Property(task => task.Title).HasMaxLength(120).IsRequired();
        modelBuilder.Entity<TaskItem>().Property(task => task.Description).HasMaxLength(1000);
        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<User>().Property(user => user.Name).HasMaxLength(80).IsRequired();
        modelBuilder.Entity<User>().Property(user => user.Email).HasMaxLength(160).IsRequired();
        modelBuilder.Entity<User>().Property(user => user.PasswordHash).IsRequired();
    }
}
