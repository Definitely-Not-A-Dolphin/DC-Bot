import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import config from "../config.json" with { type: "json"};

const client: Client<boolean> = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(import.meta.dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

  const commandsPath: string = path.join(foldersPath, folder);
  const commandFiles: string[] = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts"));

  for (const file of commandFiles) {

    const filePath: string = path.join(commandsPath, file);
    const command: any = await import(`file:///${filePath}`)

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
};

const eventsPath: string = path.join(import.meta.dirname, "events");
const eventFiles: string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts"));

for (const file of eventFiles) {
  const filePath: string = path.join(eventsPath, file);
  const event: any = await import(`file:///${filePath}`)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(config.token);
