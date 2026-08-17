import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initialClients, initialProjects, initialSettings } from '../../src/data/initialData';
import { Client, Project, SiteSettings } from '../../src/types';

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
}

function sortClients(clients: Client[]) {
  return [...clients].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getPublicProjects(projects: Project[]) {
  return sortProjects(projects.filter(p => p.status === 'published'));
}

function getActiveClients(clients: Client[]) {
  return sortClients(clients.filter(c => c.status === 'active'));
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const settings: SiteSettings = initialSettings;
  const projects = initialProjects;
  const clients = initialClients;

  return res.status(200).json({
    settings,
    projects: getPublicProjects(projects),
    clients: getActiveClients(clients),
  });
}
