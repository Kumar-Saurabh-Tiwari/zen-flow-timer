<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep workspace customization in SettingsSidebar and reusable HeadingSizeControl; timer execution stays in the existing route and Timer so presentation changes do not reset countdowns.
- Store heading sizes alongside existing local routine settings, with per-block overrides and backward-compatible defaults, to preserve existing saved sessions.
- Calendar date keys use the selected IANA timezone; personal local events are scoped to that timezone and stored alongside local routine preferences, not presented as external calendar data.
