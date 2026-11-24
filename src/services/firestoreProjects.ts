import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SavedProject } from '../types/financial';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const PROJECTS_COLLECTION = 'projects';
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function ensureValidProjectId(id: string): string {
  const cleaned = (id || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  if (!cleaned || !ID_REGEX.test(cleaned)) {
    return `proj_${Date.now()}`;
  }
  return cleaned;
}

/**
 * Recursively strips undefined values so Firestore native Maps/Lists store cleanly
 */
function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) {
    return null as unknown as T;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(value as Record<string, any>)) {
    if (v !== undefined) {
      result[k] = sanitizeForFirestore(v);
    }
  }
  return result as T;
}

function buildSanitizedPayload(project: SavedProject, ownerId: string) {
  const safeName = (project.name || 'Proyecto Sin Título').trim().slice(0, 150) || 'Proyecto Sin Título';

  const boundedInputs = {
    ...project.inputs,
    student: {
      ...project.inputs.student,
      teamMembers: (project.inputs.student.teamMembers || []).slice(0, 20),
    },
    investments: (project.inputs.investments || []).slice(0, 50),
    products: (project.inputs.products || []).slice(0, 50),
    operatingExpenses: (project.inputs.operatingExpenses || []).slice(0, 50),
  };

  return {
    ownerId,
    name: safeName,
    inputs: sanitizeForFirestore(boundedInputs),
    diagnosis: project.diagnosis ? sanitizeForFirestore(project.diagnosis) : null,
    summary: project.summary ? sanitizeForFirestore(project.summary) : null,
  };
}

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (val && typeof (val as any).toDate === 'function') {
    return (val as any).toDate().toISOString();
  }
  if (typeof val === 'string') {
    return val;
  }
  return new Date().toISOString();
}

export function subscribeUserProjects(
  userId: string,
  onProjectsChange: (projects: SavedProject[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, PROJECTS_COLLECTION), where('ownerId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: SavedProject[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || data.inputs?.student?.projectName || 'Proyecto Guardado',
          createdAt: timestampToIso(data.createdAt),
          updatedAt: timestampToIso(data.updatedAt),
          inputs: data.inputs,
          diagnosis: data.diagnosis ?? null,
          summary: data.summary ?? undefined,
        };
      });

      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onProjectsChange(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
      } catch (wrappedErr: any) {
        if (onError) onError(wrappedErr);
      }
    }
  );
}

export async function createCloudProject(project: SavedProject, userId: string): Promise<string> {
  const projectId = ensureValidProjectId(project.id);
  const docPath = `${PROJECTS_COLLECTION}/${projectId}`;
  const payload = buildSanitizedPayload(project, userId);

  try {
    await setDoc(doc(db, PROJECTS_COLLECTION, projectId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateCloudProject(project: SavedProject, userId: string): Promise<void> {
  const projectId = ensureValidProjectId(project.id);
  const docPath = `${PROJECTS_COLLECTION}/${projectId}`;
  const payload = buildSanitizedPayload(project, userId);

  try {
    await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
      name: payload.name,
      inputs: payload.inputs,
      diagnosis: payload.diagnosis,
      summary: payload.summary,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  const safeId = ensureValidProjectId(projectId);
  const docPath = `${PROJECTS_COLLECTION}/${safeId}`;

  try {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
