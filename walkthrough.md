# Next.js Migration Walkthrough

This document outlines the steps taken to migrate the School Presentation Studio to Next.js 15 and integrate Game Mode quiz components.

## Changes Made

1.  **Project Initialization**:
    - Created `school-presentation-next` using Next.js 15, React 19, TypeScript, and Tailwind CSS.
    - Configured `@/` alias and `noImplicitAny: false` in `tsconfig.json` to facilitate migration.

2.  **Core Migration**:
    - **Theme**: Ported `globals.css` and `tailwind.config.ts`, including custom colors and animations.
    - **Dashboard**: Created `src/app/page.tsx` as the main dashboard, replacing `Dashboard.tsx`.
    - **Slide Editor**: Created `src/app/editor/[deckId]/page.tsx`, replacing `SlideEditor.tsx`.
    - **Live Session**: Created `src/app/live/[joinCode]/page.tsx`, replacing `LiveSession.tsx`.
    - **Presenter View**: Created `src/app/present/[id]/page.tsx`, replacing `PresenterView.tsx`.

3.  **Quiz Integration (Game Mode)**:
    - **Renderer**: Ported `GameQuizRenderer.tsx` from Game Mode to `src/components/quiz/GameQuizRenderer.tsx`.
    - **Dependencies**: Copied `quiz-studio` components to `src/components/quiz-studio`.
    - **Player**: Updated `QuizPlayer.tsx` to use `GameQuizRenderer`, enabling all rich quiz types (Matching, Essay, etc.).
    - **Base Components**: Ported `src/components/base` (Latex, Media) required by quiz components.

4.  **Shared Logic**:
    - **Stores**: Copied Zustand stores from `src/stores`.
    - **Hooks/API**: Copied `src/hooks`, `src/api`, and `src/graphql`.
    - **UI Components**: Copied Shadcn UI components to `src/components/ui`.
    - **Utils**: Copied `src/lib`.

## Verification Steps

1.  **Install Dependencies**:
    The system has attempted to install dependencies. If you encounter missing modules, run:

    ```bash
    npm install framer-motion lucide-react clsx tailwind-merge zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-youtube react-dropzone react-hook-form zod @hookform/resolvers/zod katex react-mathquill react-player/youtube dayjs lodash-es sass
    ```

    Also ensure UI components (radix-ui) are installed.

2.  **Run Development Server**:

    ```bash
    cd school-presentation-next
    npm run dev
    ```

3.  **Test Routes**:
    - **Dashboard**: `http://localhost:3000/` - Should show decks.
    - **Editor**: `http://localhost:3000/editor/new` - Should open editor.
    - **Presenter**: `http://localhost:3000/present/[id]` - Should show presentation.
    - **Live**: `http://localhost:3000/live/[code]` - Should show join screen.

4.  **Verify Quiz**:
    - Open a presentation with a quiz in Presenter view.
    - Ensure the quiz renders using the new `GameQuizRenderer`.

## Known Issues / Next Steps

- **Type Errors**: `noImplicitAny` is set to `false` to allow the build to proceed despite missing types in ported files. You may want to gradually enable strict mode and fix types.
- **Env Variables**: Ensure `NEXT_PUBLIC_API_URL` is set in `.env.local` if needed (defaulting to localhost in code).
- **React 19 Compatibility**: Some libraries (like `react-beautiful-dnd` or older `dnd-kit`) might have peer dependency warnings with React 19.
