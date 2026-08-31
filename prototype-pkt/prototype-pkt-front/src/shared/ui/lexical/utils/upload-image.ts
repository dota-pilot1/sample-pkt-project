import { uploadImage } from "../../../api/upload";

export async function uploadImageToS3(file: File): Promise<string> {
  return uploadImage(file, "dev-study");
}
