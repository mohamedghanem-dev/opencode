import { Component, Show } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"

type PromptDragOverlayProps = {
  type: "image" | "@mention" | null
  label: string
}

const kindToIcon = {
  image: "photo",
  "@mention": "link",
} as const

export const PromptDragOverlay: Component<PromptDragOverlayProps> = (props) => {
  return (
    <Show when={props.type !== null}>
      <div
        class="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] pointer-events-none backdrop-blur-sm"
        style={{
          "background-color": "color-mix(in srgb, var(--v2-background-bg-base) 88%, transparent)",
        }}
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="flex items-center justify-center size-12 rounded-full"
            style={{
              "background-color": "color-mix(in srgb, var(--v2-background-bg-accent) 14%, transparent)",
              border: "1.5px solid color-mix(in srgb, var(--v2-background-bg-accent) 35%, transparent)",
            }}
          >
            <Icon
              name={props.type ? kindToIcon[props.type] : kindToIcon.image}
              class="size-5"
              style={{ color: "var(--v2-icon-icon-accent)" }}
            />
          </div>
          <span class="text-14-medium" style={{ color: "var(--v2-text-text-base)" }}>
            {props.label}
          </span>
        </div>
      </div>
    </Show>
  )
}
