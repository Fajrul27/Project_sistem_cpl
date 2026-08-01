from PIL import Image

def resize_image(input_path, output_path, max_size=(128, 128)):
    try:
        img = Image.open(input_path)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(output_path, optimize=True, quality=85)
        print(f"Successfully resized {input_path} to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

resize_image("fe/public/logo.png", "fe/public/logo.png")
