#!/usr/bin/env node
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {NodeSSH} from "node-ssh";

const server = new McpServer({
  name: "ssh-mcp",
  version: "1.0.0",
});

// SSH connections pool
const connections = new Map();

// Default connection config from env
const defaultHost = process.env.SSH_HOST || "127.0.0.1";
const defaultPort = parseInt(process.env.SSH_PORT) || 22;
const defaultUser = process.env.SSH_USER || "root";
const defaultPassword = process.env.SSH_PASSWORD || "";

async function getConnection(host) {
  const connKey = host || defaultHost;

  if (!connections.has(connKey)) {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: host || defaultHost,
      port: defaultPort,
      username: defaultUser,
      password: defaultPassword,
      readyTimeout: 30000,
    });
    connections.set(connKey, ssh);
  }

  return connections.get(connKey);
}

server.tool(
    "ssh_exec",
    "Execute a command on a remote server via SSH",
    {
      command: z.string().describe("The command to execute"),
      host: z.string().optional().describe("SSH host (defaults to env SSH_HOST)"),
    },
    async ({command, host}) => {
      try {
        const ssh = await getConnection(host);
        const result = await ssh.execCommand(command);

        return {
          content: [
            {
              type: "text",
              text: `Exit Code: ${result.code}\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
);

server.tool(
    "ssh_upload",
    "Upload a local file to a remote server via SCP",
    {
      localPath: z.string().describe("Path to the local file"),
      remotePath: z.string().describe("Destination path on the remote server"),
      host: z.string().optional().describe("SSH host (defaults to env SSH_HOST)"),
    },
    async ({localPath, remotePath, host}) => {
      try {
        const ssh = await getConnection(host);
        await ssh.putFile(localPath, remotePath);

        return {
          content: [
            {
              type: "text",
              text: `Successfully uploaded ${localPath} -> ${remotePath}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
);

server.tool(
    "ssh_download",
    "Download a remote file from a server via SCP",
    {
      remotePath: z.string().describe("Path to the remote file"),
      localPath: z.string().describe("Destination path on the local machine"),
      host: z.string().optional().describe("SSH host (defaults to env SSH_HOST)"),
    },
    async ({remotePath, localPath, host}) => {
      try {
        const ssh = await getConnection(host);
        await ssh.getFile(localPath, remotePath);

        return {
          content: [
            {
              type: "text",
              text: `Successfully downloaded ${remotePath} -> ${localPath}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
);

server.tool(
    "ssh_list_dir",
    "List contents of a remote directory",
    {
      remotePath: z.string().describe("Path to the remote directory"),
      host: z.string().optional().describe("SSH host (defaults to env SSH_HOST)"),
    },
    async ({remotePath, host}) => {
      try {
        const ssh = await getConnection(host);
        const result = await ssh.execCommand(`ls -la "${remotePath}"`);

        if (result.code !== 0) {
          return {
            content: [
              {
                type: "text",
                text: `Error listing directory: ${result.stderr}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: result.stdout,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SSH MCP Server running on stdio");
}

main().catch(console.error);
