using System.Diagnostics;
using BasicWebTemplate.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BasicWebTemplate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController(AppDbContext db) : ControllerBase
{
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        var checkedAtUtc = DateTime.UtcNow;

        try
        {
            await using var connection = db.Database.GetDbConnection();
            await connection.OpenAsync(cancellationToken);

            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT CAST(1 AS int)";
            command.CommandTimeout = 5;

            var result = await command.ExecuteScalarAsync(cancellationToken);
            stopwatch.Stop();

            var hasResult = result is not null && result != DBNull.Value;

            return Ok(new DatabaseStatusResponse(
                Status: "ok",
                DatabaseConnected: true,
                HasResult: hasResult,
                Result: result?.ToString(),
                CheckedAtUtc: checkedAtUtc,
                ElapsedMilliseconds: stopwatch.ElapsedMilliseconds,
                Message: hasResult
                    ? "Database query returned a result."
                    : "Database query completed but returned no result.",
                Error: null));
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            return StatusCode(StatusCodes.Status503ServiceUnavailable, new DatabaseStatusResponse(
                Status: "error",
                DatabaseConnected: false,
                HasResult: false,
                Result: null,
                CheckedAtUtc: checkedAtUtc,
                ElapsedMilliseconds: stopwatch.ElapsedMilliseconds,
                Message: "Database query failed.",
                Error: ex.Message));
        }
    }
}

public sealed record DatabaseStatusResponse(
    string Status,
    bool DatabaseConnected,
    bool HasResult,
    string? Result,
    DateTime CheckedAtUtc,
    long ElapsedMilliseconds,
    string Message,
    string? Error);
