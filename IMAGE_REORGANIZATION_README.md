# Image Folder Reorganization

## Overview
This update reorganizes the `/src/assets/images/` folder into two subfolders:
- `heroes/` - Contains all hero character images
- `maps/` - Contains all map/location images

## What Was Changed

### 1. Directory Structure
Created two new subdirectories:
- `/src/assets/images/heroes/`
- `/src/assets/images/maps/`

### 2. Code Updates

#### Updated Files:
1. **`/src/lib/data.ts`** - Updated all map image imports to use `@/assets/images/maps/` path
2. **`/src/components/heroes/HeroImage.tsx`** - Updated all hero image imports to use `@/assets/images/heroes/` path

All import statements now correctly reference the new subfolder structure.

### 3. Migration Scripts

Two scripts are provided to move the image files:

#### Node.js Script (Recommended)
```bash
node organize-images.js
```

This script will:
- Move 71 hero images to `heroes/` subfolder
- Move 26 map images to `maps/` subfolder
- Provide progress feedback and summary

#### Bash Script (Alternative)
```bash
chmod +x organize-images.sh
./organize-images.sh
```

## Files to Move

### Hero Images (71 files) → `heroes/`
All character artwork files including:
- Achilles.gif, Alice.png, Beowulf.webp, Bruce_Lee.jpg, etc.
- All hero character portraits and artwork

### Map Images (26 files) → `maps/`
All map/location images including:
- Azuchi_Castle.webp, Baskerville_Manor.webp, Heorot.webp, etc.
- All game board maps and location artwork

## How to Complete the Migration

### Option 1: Automatic (Recommended)
Run the migration script:
```bash
node organize-images.js
```

### Option 2: Manual
1. Move each hero image from `/src/assets/images/` to `/src/assets/images/heroes/`
2. Move each map image from `/src/assets/images/` to `/src/assets/images/maps/`
3. Refer to `IMAGE_ORGANIZATION.md` for complete file lists

## Verification

After moving the files, verify that:
1. All hero images display correctly in the Heroes tab
2. All map images display correctly in the Players tab (Never Played Maps section)
3. No broken image links appear anywhere in the app

## Benefits

✅ **Better Organization**: Clear separation between hero and map images
✅ **Easier Maintenance**: Faster to find and manage specific image types
✅ **Scalability**: Easier to add new images in the future
✅ **Code Clarity**: Import statements clearly indicate image type

## Rollback

If you need to revert this change:
1. Move all images from `heroes/` and `maps/` back to the parent `images/` folder
2. Update the import paths in `data.ts` and `HeroImage.tsx` to remove the subfolder references

## Notes

- The code has been updated to use the new paths
- The directory structure has been created
- Image files need to be physically moved using one of the provided scripts
- No functionality changes - this is purely organizational
