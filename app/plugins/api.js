import {client} from "@/client/client.gen.ts";

export default defineNuxtPlugin((nuxtApp) => {
    const runtimeConfig = useRuntimeConfig()
    client.setConfig({
        baseURL: runtimeConfig.public.apiBaseUrl,
        timeout: 30000,
    });

    client.instance.interceptors.request.use((config) => {
        config.headers.set('Authorization', 'Bearer ' + generateRandomString(31));
        return config;
    });


    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
});