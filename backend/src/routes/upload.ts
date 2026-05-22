import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { authenticate, requireAdmin } from '../middleware/authenticate.js';
import { ok, fail, HttpError } from '../lib/http.js';
import { uploadObject, getSignedReadUrl } from '../lib/s3.js';
import { v4 as uuid } from 'uuid';

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

r.use(authenticate);

r.post('/avatar', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, 'No file');
    const buf = await sharp(req.file.buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
    const url = await uploadObject(`avatars/${req.user!.id}.webp`, buf, 'image/webp', true);
    ok(res, { url });
  } catch (e) { next(e); }
});

r.post('/deposit-proof', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, 'No file');
    if (req.file.size > 10 * 1024 * 1024) throw new HttpError(400, 'Max 10MB');
    if (!req.file.mimetype.startsWith('image/')) throw new HttpError(400, 'Image only');
    const buf = await sharp(req.file.buffer).resize(1600, 1600, { fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
    const url = await uploadObject(`deposits/${req.user!.id}/${uuid()}.jpg`, buf, 'image/jpeg', true);
    ok(res, { url });
  } catch (e) { next(e); }
});

r.post('/kyc', upload.array('files', 4), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new HttpError(400, 'No files');
    const uploaded: Array<{ key: string; url: string }> = [];
    for (const f of files) {
      const buf = await sharp(f.buffer).resize(2000, 2000, { fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
      const key = `kyc/${req.user!.id}/${uuid()}.jpg`;
      await uploadObject(key, buf, 'image/jpeg', false);
      const signed = await getSignedReadUrl(key, 3600);
      uploaded.push({ key, url: signed });
    }
    ok(res, uploaded);
  } catch (e) { next(e); }
});

r.post('/asset', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, 'No file');
    const ext = req.file.originalname.split('.').pop() || 'bin';
    const url = await uploadObject(`assets/${uuid()}.${ext}`, req.file.buffer, req.file.mimetype, true);
    ok(res, { url });
  } catch (e) { next(e); }
});

r.get('/kyc/:key/signed', async (req, res, next) => {
  try {
    const url = await getSignedReadUrl(decodeURIComponent(req.params.key), 3600);
    ok(res, { url });
  } catch (e) { next(e); }
});

export default r;
