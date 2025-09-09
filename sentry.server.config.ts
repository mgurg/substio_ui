import * as Sentry from "@sentry/nuxt";

Sentry.init({
    dsn: "https://4a540d408955e61a84bc53f2fcdcb2ff@o4509883697004544.ingest.de.sentry.io/4509920514539600",

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    integrations: (integrations) => {
        if (process.env.NODE_ENV === "development") {
            // Apply filter only in dev
            return integrations.filter(
                (integration) =>
                    integration.name !== "OpenTelemetry" &&
                    integration.name !== "Http"
            );
        }
        // In production, use all integrations
        return integrations;
    },
});
