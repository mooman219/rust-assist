import * as child_process from 'child_process';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Output {
    stdout: string;
    stderr: string;
    code: number;
}

export function spawn(
    cmd: string,
    args?: Array<string>,
    options?: child_process.SpawnOptions
): Promise<Output> {
    console.log(`Rust Assist: Running '${cmd} ${args ? args.join(' ') : ''}'`);
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        const proc = child_process.spawn(cmd, args, options);

        proc.stdout.on('data', (data) => stdout += data);
        proc.stderr.on('data', (data) => stderr += data);
        proc.on('close', (code) => resolve({ stdout, stderr, code }));
        proc.on('error', (err) => reject(err));
    });
}

export class Project {
    private _path: string;

    public constructor(path: string) {
        this._path = path;
    }

    public get path() {
        return this._path;
    }

    public hasRootFile(fileName: string): Promise<boolean> {
        let filePath = path.join(this._path, fileName);
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.F_OK, (err) => resolve(err ? false : true));
        });
    }
}

export class ProjectList {
    private _projects: Array<Project>;

    public constructor(projects: Array<Project>) {
        this._projects = projects;
    }

    public get projects() {
        return this._projects;
    }

    public hasProjects() {
        return this._projects.length > 0;
    }

    public getParent(file: string) {
        for (const project of this._projects) {
            if (file.startsWith(project.path)) {
                return project;
            }
        }
        return undefined;
    }
}

/**
 * Find all projects in the workspace that contain a Cargo.toml file.
 * 
 * @returns A project list.
 */
export async function findProjects(): Promise<ProjectList> {
    let projects: Array<Project> = [];
    (await vscode.workspace.findFiles('**/Cargo.toml')).forEach(path => {
        projects.push(new Project(path.fsPath.replace(/[/\\]?Cargo\.toml$/, '')));
    });
    return new ProjectList(projects);
}