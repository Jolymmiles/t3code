import { AuthSettingsWriteScope, type EnvironmentId, type ServerConfig } from "@t3tools/contracts";
import { useState } from "react";

import { useUpdateEnvironmentSettings } from "../../hooks/useSettings";
import { useEnvironmentScope } from "../../state/session";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

type RenameServerConfig = Pick<ServerConfig, "environment" | "settings"> | null;

function resolveEnvironmentRenameLock(input: {
  readonly serverConfig: Pick<ServerConfig, "environment"> | null;
  readonly operateAccess: "granted" | "denied" | "pending";
}): string | null {
  if (input.serverConfig === null) {
    return "Connect to this environment to rename it.";
  }
  if (input.serverConfig.environment.capabilities.environmentLabel !== true) {
    return "This environment's server is too old to keep a name. Update it to rename it.";
  }
  if (input.operateAccess !== "granted") {
    return "Your session on this environment cannot change its settings.";
  }
  return null;
}

export function EnvironmentRenameDialog({
  environmentId,
  serverConfig,
  label,
  open,
  onOpenChange,
}: {
  readonly environmentId: EnvironmentId;
  readonly serverConfig: RenameServerConfig;
  readonly label: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        <EnvironmentRenameForm
          key={open ? "open" : "closed"}
          environmentId={environmentId}
          serverConfig={serverConfig}
          label={label}
          onClose={() => onOpenChange(false)}
        />
      </DialogPopup>
    </Dialog>
  );
}

function EnvironmentRenameForm({
  environmentId,
  serverConfig,
  label,
  onClose,
}: {
  readonly environmentId: EnvironmentId;
  readonly serverConfig: RenameServerConfig;
  readonly label: string;
  readonly onClose: () => void;
}) {
  const updateSettings = useUpdateEnvironmentSettings(environmentId);
  const operateAccess = useEnvironmentScope(environmentId, AuthSettingsWriteScope)
    ? "granted"
    : "denied";
  const lock = resolveEnvironmentRenameLock({ serverConfig, operateAccess });
  const customLabel = serverConfig?.settings?.environmentLabel ?? null;
  const [name, setName] = useState(label);

  const save = (environmentLabel: string | null) => {
    if (lock !== null) return;
    if (environmentLabel !== customLabel) {
      updateSettings({ environmentLabel });
    }
    onClose();
  };
  const submit = () => {
    const trimmed = name.trim();
    save(trimmed === "" || (customLabel === null && trimmed === label) ? null : trimmed);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Rename environment</DialogTitle>
        <DialogDescription>
          Every client connected to this environment shows this name. Leave it empty to use the
          default name.
        </DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <div className="grid gap-1.5">
          <span className="text-xs font-medium text-foreground">Name</span>
          <Input
            aria-label="Environment name"
            disabled={lock !== null}
            maxLength={64}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
          />
        </div>
        {lock !== null ? <p className="text-xs text-muted-foreground">{lock}</p> : null}
      </DialogPanel>
      <DialogFooter>
        {customLabel !== null ? (
          <Button
            variant="ghost"
            className="sm:mr-auto"
            disabled={lock !== null}
            onClick={() => save(null)}
          >
            Use default name
          </Button>
        ) : null}
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={lock !== null} onClick={submit}>
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
