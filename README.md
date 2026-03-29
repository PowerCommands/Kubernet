# Kubernet

First vertical slice of a read-only Kubernetes dashboard for a k3s cluster.

## Scope

- Backend: ASP.NET Core Web API on .NET 10
- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS with a small shadcn-style component structure
- Data: Read-only cluster overview for nodes, namespaces, and pods

This step intentionally keeps the feature set small:

- No authentication
- No write actions
- No Prometheus integration
- No real-time streaming

## Project Structure

All code lives under `src`.

- `src/Kubernet.Api`: ASP.NET Core Web API
- `src/kubernet-dashboard`: React + Vite frontend

## Publish container with Dockube

**GUI**
```
build https://github.com/PowerCommands/Kubernet.git "kubernet" --dockerfile=Dockerfile.web --publish
```
**API**
```
build https://github.com/PowerCommands/Kubernet.git "kubernet" --dockerfile=Dockerfile.api --publish
```

## Backend Endpoints

- `GET /api/cluster/summary`
- `GET /api/nodes`
- `GET /api/namespaces`
- `GET /api/pods`

## Kubernetes Access

The backend supports two connection modes:

1. In-cluster configuration
   - Used when the app runs inside Kubernetes and Kubernetes service account files are available.
2. Local kubeconfig
   - Used when running locally.
   - The client checks `KUBECONFIG` first.
   - If `KUBECONFIG` is not set, the Kubernetes client falls back to the default kubeconfig lookup behavior.

No cluster credentials are hardcoded in the application.

## Local Development

### Backend

If you have a local .NET 10 SDK installed:

```bash
dotnet restore src/Kubernet.Api/Kubernet.Api.csproj
dotnet run --project src/Kubernet.Api/Kubernet.Api.csproj
```

Useful environment variables:

```bash
export ASPNETCORE_ENVIRONMENT=Development
export KUBECONFIG=$HOME/.kube/config
```

### Frontend

If you have Node.js installed locally:

```bash
cd src/kubernet-dashboard
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` to `http://localhost:8080`.

### Example Development Settings

Example backend settings file:

- [`appsettings.Development.example.json`](/mnt/c/Repos/Github/Kubernet/src/Kubernet.Api/appsettings.Development.example.json)

Example environment variable usage:

```bash
export KUBECONFIG=$HOME/.kube/config
export KUBECONFIG_PATH=$HOME/.kube/config
```

`KUBECONFIG_PATH` is used by [`docker-compose.yml`](/mnt/c/Repos/Github/Kubernet/docker-compose.yml) to mount your kubeconfig into the API container.

If another tool manages the active kubeconfig by replacing the Windows kubeconfig file, point `KUBECONFIG_PATH` at that file instead so the dashboard follows the same active cluster:

```bash
export KUBECONFIG_PATH=/mnt/c/Users/your-user/.kube/config
```

This is the recommended setup when Dockube controls the active environment on the Windows side.

## Container Workflow

The repository also includes a local container workflow for environments where the host toolchain is incomplete.

For local Docker-based development, the API container uses host networking so kubeconfigs that point at loopback endpoints such as `https://127.0.0.1:<port>` still work. The dashboard container runs on an explicit bridge network and proxies API requests through that network gateway.

### Start the stack

```bash
docker compose down
docker compose up --build -d
```

Services:

- API: `http://localhost:8080`
- Dashboard: `http://localhost:8081`

The dashboard container proxies `/api` traffic to the backend container.

## Notes

- This slice returns UI-focused DTOs instead of raw Kubernetes resources.
- The dashboard is desktop-first and intentionally simple so it is easy to grow incrementally.
- Node capacity planning uses Kubernetes resource requests only. For init containers, the backend applies Kubernetes scheduling semantics by using the maximum init-container request per resource instead of naively summing all init containers.
- Disk values in the node table are based on Kubernetes `ephemeral-storage` capacity, allocatable, and requests. They represent scheduler-visible free space, not live filesystem usage.
