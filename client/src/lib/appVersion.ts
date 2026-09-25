// Injected by vite.config.ts from package.json ("version" and "buildNumber").
declare const __APP_VERSION__: string;
declare const __APP_BUILD__: number;

export const APP_VERSION = __APP_VERSION__;
export const APP_BUILD = __APP_BUILD__;
export const APP_VERSION_LABEL = `Version ${APP_VERSION} (build ${APP_BUILD})`;
