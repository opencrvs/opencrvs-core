Write-Host "Running data cleanup"

$Namespace = "opencrvs-dev"

$Jobs = @(
    "data-cleanup",
    "postgres-on-deploy",
    "data-migration",
    "data-migration-analytics",
    "data-seed",
    "elasticsearch-reindex"
)

foreach ($Job in $Jobs) {
    kubectl delete job $Job -n $Namespace --ignore-not-found

    if ($Job -eq "data-seed") {
        kubectl delete pod -l app=events -n $Namespace
    }

    tilt trigger $Job

    Start-Sleep -Seconds 10

    kubectl wait `
        --for=condition=complete `
        --timeout=300s `
        "job/$Job" `
        -n $Namespace

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Job $Job failed or timed out"
        exit 1
    }

    Write-Host "======================== Job $Job completed ==============================="

    kubectl logs "job/$Job" -n $Namespace
}

Write-Host "Cleanup was successful"