import zlib from 'zlib';
import type { Request, Response, NextFunction } from 'express';

/**
 * Lightweight HTTP Compression Middleware using Node.js built-in zlib.
 * Compresses JSON responses using Gzip without requiring external npm packages.
 */
export function gzipCompression(req: Request, res: Response, next: NextFunction) {
    const acceptEncoding = (req.headers['accept-encoding'] || '') as string;
    if (!acceptEncoding.includes('gzip')) {
        return next();
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
        try {
            const jsonString = JSON.stringify(body);
            // Only compress if payload is larger than 1KB (1024 bytes)
            if (jsonString.length < 1024) {
                return originalJson(body);
            }

            zlib.gzip(Buffer.from(jsonString, 'utf-8'), (err, compressed) => {
                if (err) {
                    return originalJson(body);
                }
                res.setHeader('Content-Encoding', 'gzip');
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.setHeader('Content-Length', compressed.length.toString());
                res.status(res.statusCode || 200).end(compressed);
            });
            return res;
        } catch (e) {
            return originalJson(body);
        }
    };

    next();
}
