import { Show, createResource } from "solid-js"

async function fetchUsername(): Promise<string | null> {
  try {
    const api = (window as any).api
    if (!api?.getOSUsername) return null
    const name = await api.getOSUsername()
    if (!name) return null
    // Usernames from the OS are often lowercase system handles (e.g. "mohamed.ghanem");
    // present a friendlier capitalized first segment.
    const first = name.split(/[.\s_-]+/)[0]
    return first.charAt(0).toUpperCase() + first.slice(1)
  } catch {
    return null
  }
}

export function WelcomeGreeting() {
  const [username] = createResource(fetchUsername)

  return (
    <div class="flex flex-col gap-1 select-none" dir="auto">
      <h1 class="text-20-medium text-v2-text-text-base">
        <Show when={username()} fallback="Welcome to Nitro Code">
          {(name) => <>Welcome to Nitro Code, {name()}</>}
        </Show>
      </h1>
      <p class="text-14-regular text-v2-text-text-faint" dir="rtl">
        <Show when={username()} fallback="أهلاً بيك في Nitro Code">
          {(name) => <>أهلاً بيك في Nitro Code يا {name()}</>}
        </Show>
      </p>
    </div>
  )
}
