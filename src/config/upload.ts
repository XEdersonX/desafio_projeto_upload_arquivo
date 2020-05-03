import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

// Para pegar o caminho do diretorio onde vai ficar os arquivos importados.
const tmpFolter = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpFolter, // Para gente saber diretorio dos arquivos.

  storage: multer.diskStorage({
    destination: tmpFolter,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
