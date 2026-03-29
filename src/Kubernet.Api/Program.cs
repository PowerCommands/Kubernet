using Kubernet.Api.Configuration;
using Kubernet.Api.Endpoints;
using Kubernet.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddDashboardOptions(builder.Configuration)
    .AddDashboardServices(builder.Configuration);

var app = builder.Build();
app.UseConfiguredCors();

app.MapDashboardEndpoints();

app.Run();
