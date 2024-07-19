import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  bucket = 'meteno';

  async uploadFile(path: string, file: Express.Multer.File): Promise<any> {
    try {
      console.log(file);
      const blob = new Blob([file.buffer], { type: file.mimetype });
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(path, blob);
      if (error) throw new Error(error.message);
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getFile(path: string): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(path);
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteFile(path: string): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);
    if (error) throw new Error(error.message);
    return data;
  }
}
