
# High-Availability Enterprise Infrastructure on Docker Swarm

Comprehensive production operational documentation for the multi-node AWS Docker Swarm cluster. This document details incoming ingress routing, edge load balancing, continuous deployment flows, database replication topologies, environment configurations via `.env`, and validation playbooks.

---

## Architecture Overview

![High-Availability Production Docker Swarm Infrastructure](./architecture-diagram.jpg)

---

## 1. Network & Traffic Topology

Traefik acts as the centralized Edge Ingress Controller, terminating TLS, enforcing HTTP-to-HTTPS redirection, and resolving internal Swarm Overlay Networks to proxy traffic dynamically based on Host headers without exposing backend services or database nodes to the public internet.


```

```
                      [ Public Traffic / Internet ]
                                   |
                                   v
                 [ AWS Elastic IP: 54.175.56.43 ]
                                   |
                +------------------+------------------+
                |                                     |
                v                                     v
         [ Port 80 (HTTP) ]                  [ Port 443 (HTTPS) ]
                |                                     |
                +-----> (Automatic HTTPS 301) ------->|
                                                      v
                                        [ Traefik Reverse Proxy ]
                                        (Manager Node Binding)
                                                      |
     +------------------------------------------------+------------------------------------------------+
     |                                                |                                                |
     v                                                v                                                v

```

Host: stage.54-175-56-43.nip.io                 Host: grafana.54-175-56-43.nip.io             Host: jenkins.54-175-56-43.nip.io
|                                                |                                                |
v                                                v                                                v
[ Frontend Web Service ]                        [ Grafana Dashboards ]                         [ Jenkins CI/CD Engine ]
(Nginx Reverse Proxy)                           (Metrics Visualization)                        (Automation Controller)
|                                                |
v                                                |
[ Static Assets ]                                      v
[ Prometheus Server ]
(Scrapes Metrics)
^
|
+----------------------------------------+----------------------------------------+
|                                                                                 |
v                                                                                 v
[ Node Exporter (Global) ]                                                         [ cAdvisor (Global) ]
(Host Metrics Across 3 Nodes)                                                      (Per-Container Analytics)

---

```
                                      DATABASE DATA PLANE (ISOLATED)

```

---

```
                                            [ Backend API Service ]
                                            (Internal Overlay Network)
                                                      |
                                                      v (Port 5432)
                                            [ Pgpool-II HA Proxy ]
                                         (Load Balancing & Failover)
                                                      |
                            +-------------------------+-------------------------+
                            | (Write Traffic Only)                              | (Read Queries Balanced)
                            v                                                   v
                 [ PostgreSQL Primary ] <=========== Repmgr ============> [ PostgreSQL Standby ]
                    (Read / Write)            (Streaming Replication)            (Read-Only Replica)

```

```

---

## 2. Environment Configuration (`.env.example`)

Create a `.env` file in the root deployment directory matching the example template below:

```ini
# ==========================================
# 1. Cluster & Domain Configuration
# ==========================================
PUBLIC_IP=54.175.56.43
BASE_DOMAIN=54-175-56-43.nip.io
ACME_EMAIL=admin@example.com

# ==========================================
# 2. Container Registry Details
# ==========================================
DOCKER_REGISTRY_USER=omarabdo4
APP_IMAGE_TAG=staging-15

# ==========================================
# 3. High-Availability Database Cluster
# ==========================================
POSTGRESQL_DB_PORT=5432
POSTGRESQL_DATABASE=cars_staging_db
POSTGRESQL_USERNAME=postgres
POSTGRESQL_PASSWORD=CarsRootSecret2026#

# Repmgr Replication Credentials
REPMGR_USERNAME=repmgr
REPMGR_PASSWORD=CarsRootSecret2026#
REPMGR_DATABASE=repmgr

# Pgpool-II Settings
PGPOOL_BACKEND_NODES=0:app_pg-primary:5432,1:app_pg-standby:5432
PGPOOL_SR_CHECK_USER=postgres
PGPOOL_SR_CHECK_PASSWORD=CarsRootSecret2026#
PGPOOL_ADMIN_USERNAME=admin
PGPOOL_ADMIN_PASSWORD=CarsRootSecret2026#

# ==========================================
# 4. Monitoring Authentication
# ==========================================
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=AdminMonitoring2026#
PROMETHEUS_RETENTION_TIME=15d

```

---

## 3. Deployment Sequence

### Step 1: Initialize Swarm Overlay Networks

Create isolated overlay networks to decouple routing, application communication, database storage, and telemetry scraping:

```bash
docker network create --driver overlay --attachable traefik_public
docker network create --driver overlay --attachable app_net
docker network create --driver overlay --attachable db_net
docker network create --driver overlay --attachable monitoring_net

```

### Step 2: Deploy Ingress Edge Proxy

Launch Traefik to bind to ports 80 and 443 on the Manager node:

```bash
docker stack deploy -c 01-traefik-stack.yml traefik

```

### Step 3: Deploy High-Availability Database Cluster

Spin up PostgreSQL Primary, Standby, and the Pgpool-II connection pooler:

```bash
docker stack deploy -c 02-database-stack.yml app

```

Verify replication delay and node health through Pgpool-II:

```bash
docker exec -it -e PGPASSWORD="CarsRootSecret2026#" $(docker ps -q -f name=app_pgpool) \
  psql -h 127.0.0.1 -p 5432 -U postgres -d cars_staging_db -c "SHOW POOL_NODES;"

```

### Step 4: Deploy Observability Stack

Deploy Prometheus, Grafana, and globally scheduled metric exporters across all nodes:

```bash
docker stack deploy -c 03-monitoring-stack.yml monitoring

```

* `node-exporter` and `cadvisor` run as Swarm `global` services (`3/3` tasks across all nodes).
* Prometheus scrapes host metrics and container performance metrics at scheduled intervals.
* Grafana provides real-time dashboards accessible via `https://grafana.54-175-56-43.nip.io`.

### Step 5: Execute Automated CI/CD Rolling Updates

Jenkins builds, tags, and pushes images dynamically, triggering rolling updates to the Swarm cluster with zero service disruption:

```bash
docker service update --image omarabdo4/cars-web:staging-15 app_frontend
docker service update --image omarabdo4/cars-api:staging-15 app_backend

```

---

## 4. Verification & Health Audit

```bash
# Verify active cluster members
docker node ls

# Confirm all service replicas are running
docker service ls

# Inspect rolling update task state on frontend
docker service ps app_frontend --no-trunc

# Query stored database records through Pgpool
docker exec -it -e PGPASSWORD="CarsRootSecret2026#" $(docker ps -q -f name=app_pgpool) \
  psql -h 127.0.0.1 -p 5432 -U postgres -d cars_staging_db -c "SELECT * FROM cars;"

```

```

```
