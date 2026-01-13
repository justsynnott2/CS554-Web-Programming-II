import express, { Request, Response } from 'express';
import minioClient, { minioBucketName } from '../config/minio';

const router = express.Router();

router.get('/:objectName', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawName = req.params.objectName;
    const objectName = decodeURIComponent(rawName);
    if (!objectName || objectName.includes('..') || objectName.includes('/') || objectName.includes('\\')) {
      res.status(400).json({ success: false, message: 'Invalid file name' });
      return;
    }

    let contentType: string | undefined;
    let size: number | undefined;
    try {
      const stat = await minioClient.statObject(minioBucketName, objectName);
      contentType = stat.metaData?.['content-type'] || stat.metaData?.['Content-Type'];
      size = stat.size;
    } catch {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    const range = req.headers.range;
    if (range && typeof size === 'number') {
      const match = /^bytes=(\d+)-(\d+)?$/i.exec(range);
      if (!match) {
        res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
        return;
      }

      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
        res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
        return;
      }

      const chunkSize = end - start + 1;
      const stream = await minioClient.getPartialObject(minioBucketName, objectName, start, chunkSize);

      if (contentType) res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
      res.setHeader('Content-Length', String(chunkSize));
      res.setHeader('Cache-Control', 'public, max-age=3600');

      stream.on('error', () => {
        if (!res.headersSent) {
          res.status(404).json({ success: false, message: 'File not found' });
        }
      });
      res.status(206);
      stream.pipe(res);
      return;
    }

    const stream = await minioClient.getObject(minioBucketName, objectName);

    if (contentType) res.setHeader('Content-Type', contentType);
    if (typeof size === 'number') res.setHeader('Content-Length', String(size));
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'File not found' });
      }
    });
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;


