interface HealthCheckResponse {
    status: 'ok'
    timestamp: string
    uptime: number
    environment: string
    memory: {
        used: number
        total: number
        percentage: number
    }
}

export default defineEventHandler(async (): Promise<HealthCheckResponse> => {
    const memUsage = process.memoryUsage()
    const totalMemory = memUsage.heapTotal
    const usedMemory = memUsage.heapUsed
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100)

    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(usedMemory / 1024 / 1024),
            total: Math.round(totalMemory / 1024 / 1024),
            percentage: memoryPercentage
        },
    }
})
