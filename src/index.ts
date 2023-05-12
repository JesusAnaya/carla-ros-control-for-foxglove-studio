import { ExtensionContext } from "@foxglove/studio";
import { initCarlaSimpleControllPanel } from "./CarlaSimpleControl";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Carla Simple Controll", initPanel: initCarlaSimpleControllPanel });
}
