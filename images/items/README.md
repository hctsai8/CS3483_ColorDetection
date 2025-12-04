# Item Images Directory

## Required Images

Place your item images in this directory with these exact names:

- table-lamp.jpg (or .png, .jpeg, .gif, .webp)
- desk-lamp.jpg (or .png, .jpeg, .gif, .webp) 
- floor-lamp.jpg (or .png, .jpeg, .gif, .webp)
- pendant-light.jpg (or .png, .jpeg, .gif, .webp)
- ceiling-fan.jpg (or .png, .jpeg, .gif, .webp)
- wall-sconce.jpg (or .png, .jpeg, .gif, .webp)

## Directory Structure
```
images/
└── items/
    ├── table-lamp.jpg
    ├── desk-lamp.png
    ├── floor-lamp.jpeg
    ├── pendant-light.gif
    ├── ceiling-fan.webp
    └── wall-sconce.jpg
```

## Troubleshooting

If you see 404 errors in the console:

1. Make sure the images directory exists in your project root
2. Verify your image files are named exactly as listed above
3. Check that Flask is serving the `/images/<filename>` route
4. Restart your Flask server after adding new images
