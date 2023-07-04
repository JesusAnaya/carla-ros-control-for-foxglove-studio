import { ExtensionContext } from "@foxglove/studio";
import { initAVSimpleControllPanel } from "./AVSimpleControl";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "Autonomous Vehicle Control", initPanel: initAVSimpleControllPanel });
}
