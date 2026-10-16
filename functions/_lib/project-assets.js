import { supabaseFetch } from './supabase.js';
export const VISUAL_BUCKET = 'crm-project-visuals';
export const MAX_LOGO_BYTES = 2097152;
export const MAX_IMAGE_BYTES = 12582912;

export function validatePng(bytes, maxBytes = MAX_LOGO_BYTES) {
  const signature = [137,80,78,71,13,10,26,10];
  if (!(bytes instanceof Uint8Array) || bytes.length < 45 || bytes.length > maxBytes || signature.some((b,i) => bytes[i] !== b) || String.fromCharCode(...bytes.slice(12,16)) !== 'IHDR') throw new Error('Use a valid PNG image within the file-size limit.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16), height = view.getUint32(20);
  if (!width || !height || width > 4096 || height > 4096) throw new Error('Images must be between 1 and 4096 pixels per side.');
  return { width, height };
}

async function storage(env, path, options = {}) {
  const url = String(env.SUPABASE_URL || '').replace(/\/+$/, ''), key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('CRM storage is not configured.');
  const response = await fetch(`${url}/storage/v1/${path}`, { ...options, headers: { apikey: key, Authorization: `Bearer ${key}`, ...(options.headers || {}) } });
  if (!response.ok) throw new Error('Private project storage is unavailable. Check migration 007 and Storage configuration.');
  return response;
}

export const assetUrl = (leadId, assetId, download = false) => `/api/crm/intelligence/leads/${leadId}/assets?asset=${assetId}${download ? '&download=1' : ''}`;
export const publicAsset = row => row ? { id: row.id, url: assetUrl(row.lead_id,row.id), createdAt: row.created_at } : null;

export async function assertVisualStorage(env) {
  const response=await storage(env,`bucket/${VISUAL_BUCKET}`);
  const bucket=await response.json();
  if(bucket.public!==false) throw new Error('Project visuals must use a private Storage bucket. Check migration 007.');
}

export async function latestLogo(env, leadId) {
  const rows = await supabaseFetch(env, 'lead_project_assets', { search: { select:'*', lead_id:`eq.${leadId}`, purpose:'eq.logo', order:'created_at.desc', limit:'1' } });
  return rows[0] || null;
}

export async function saveAsset(env, leadId, purpose, bytes, generationId = null) {
  validatePng(bytes, purpose === 'logo' ? MAX_LOGO_BYTES : MAX_IMAGE_BYTES);
  await assertVisualStorage(env);
  // A completed provider image can safely be re-saved after a network error without generating again.
  const id = purpose === 'mockup' ? generationId : crypto.randomUUID();
  const path = `${leadId}/${purpose}/${id}.png`;
  await storage(env, `object/${VISUAL_BUCKET}/${path}`, { method:'POST', headers:{'Content-Type':'image/png','x-upsert':'true'}, body:bytes });
  const rows = await supabaseFetch(env, 'lead_project_assets', { method:'POST', search:{on_conflict:'id'}, prefer:'resolution=merge-duplicates,return=representation', body:{id,lead_id:leadId,generation_id:generationId,purpose,object_path:path,mime_type:'image/png',byte_size:bytes.length} });
  return rows[0];
}

export async function readAsset(env, row) {
  // Never accept a storage path or external URL supplied by a browser/model.
  if (!new RegExp(`^${row.lead_id}/(logo|mockup)/[0-9a-f-]+\\.png$`, 'i').test(row.object_path)) throw new Error('Invalid project asset path.');
  const response = await storage(env, `object/authenticated/${VISUAL_BUCKET}/${row.object_path}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  validatePng(bytes, MAX_IMAGE_BYTES);
  return bytes;
}

export function decodeImageResult(response) {
  const images = (response.output || []).filter(item => item.type === 'image_generation_call' && typeof item.result === 'string' && item.result);
  if (images.length !== 1 || images[0].result.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(images[0].result)) throw new Error('The provider did not return one valid PNG mockup.');
  const bytes = Uint8Array.from(atob(images[0].result), c => c.charCodeAt(0));
  validatePng(bytes, MAX_IMAGE_BYTES);
  return bytes;
}

export function pngDataUrl(bytes) {
  let binary = '';
  for (let i=0;i<bytes.length;i+=16384) binary += String.fromCharCode(...bytes.subarray(i,i+16384));
  return `data:image/png;base64,${btoa(binary)}`;
}
