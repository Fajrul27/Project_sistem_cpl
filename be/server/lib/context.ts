import { AsyncLocalStorage } from 'async_hooks';

interface Context {
    userId?: string;
    skipAuditLog?: boolean;
}

export const context = new AsyncLocalStorage<Context>();

export const getCurrentContext = () => {
    return context.getStore();
};

export const withoutAuditLog = <T>(fn: () => Promise<T>): Promise<T> => {
    const currentContext = context.getStore();
    return context.run({ ...currentContext, skipAuditLog: true }, fn);
};
