import { useState } from "react";
import { addProduct } from "../utils/api";

const AddProduct = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  return (
    <div>
      <h1>Add Product</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border"
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(+e.target.value)}
        className="border"
      />
      <input
        type="file"
        placeholder="Image"
        className="border"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result && typeof e.target.result === "string") {
                setImage(e.target.result);
              }
            };
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border"
      />
      <button
        onClick={async () => {
          if (imageFile && imageFile?.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
          }
          addProduct(name, price, image, description).then((response) => {
            if (response.success) {
              onSuccess();
            }
          });
        }}
        className="border"
      >
        submit
      </button>
    </div>
  );
};

export default AddProduct;
