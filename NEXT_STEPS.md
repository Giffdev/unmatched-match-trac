# NEXT STEPS: Complete the Image Organization

## Current Status ✅
All code has been updated to reference the new folder structure:
- ✅ Hero imports point to `@/assets/images/heroes/`
- ✅ Map imports point to `@/assets/images/maps/`
- ✅ Directories created
- ✅ Migration script ready

## To Complete This Task: Run the Migration Script

### Step 1: Run the Node.js Migration Script

Open your terminal in the project root and run:

```bash
node organize-images.js
```

This will automatically:
- Move 71 hero images to the `heroes/` subfolder
- Move 26 map images to the `maps/` subfolder
- Show you progress as it moves each file
- Provide a summary when complete

### Step 2: Verify the Changes

After running the script, verify that:
1. Hero images display correctly throughout the app
2. Map images display when clicked in the "Never Played Maps" section
3. No broken images appear anywhere

### What If Something Goes Wrong?

If you encounter any issues:

1. **Images don't display**: Make sure the migration script completed successfully
2. **Build errors**: Clear the Vite cache with `npm run dev` (restart the dev server)
3. **Need to rollback**: Move all files from `heroes/` and `maps/` back to `images/`

### Alternative: Manual Migration

If you prefer to move files manually:

1. Open `/workspaces/spark-template/src/assets/images/`
2. Move each hero image (see IMAGE_ORGANIZATION.md for list) to `heroes/` subfolder
3. Move each map image (see IMAGE_ORGANIZATION.md for list) to `maps/` subfolder

## Files Updated

The following files have already been updated with new import paths:
- `/src/lib/data.ts` (26 map imports)
- `/src/components/heroes/HeroImage.tsx` (71 hero imports)

## Documentation Created

- `IMAGE_REORGANIZATION_README.md` - Full documentation
- `IMAGE_ORGANIZATION.md` - File tracking
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `organize-images.js` - Automated migration script
- `organize-images.sh` - Bash alternative
- This file (`NEXT_STEPS.md`)

## Why This Matters

This organization:
- Makes the codebase easier to navigate
- Clearly separates different types of assets
- Makes it obvious where to add new images
- Improves long-term maintainability

---

**Ready to proceed? Run:** `node organize-images.js`
