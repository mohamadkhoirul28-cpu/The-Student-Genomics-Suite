import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { parseFASTA } from '../../utils/sequenceParser';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FileDropzone({
  onFilesSelected,
  maxFiles = 20,
  maxSizeMB = 5
}: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addSequences, showToast } = useAppStore();

  // Valid DNA sequence file extensions
  const allowedExtensions = ['.fasta', '.fa', '.seq', '.txt', '.ab1'];

  const validateAndProcessFiles = (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    
    setErrorMessage(null);
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        setErrorMessage(`File format "${file.name}" is not supported. Please use .fasta, .fa, .seq, .txt, or .ab1`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setErrorMessage(`File "${file.name}" exceeds maximum size of ${maxSizeMB}MB.`);
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} files at once.`);
      return;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDropDebug = async (acceptedFiles: File[]) => {
    console.log('[Upload] Files dropped:', acceptedFiles.length);
    
    for (const file of acceptedFiles) {
      console.log('[Upload] Processing:', file.name);
      
      try {
        const text = await file.text();
        console.log('[Upload] File read, length:', text.length);
        
        const sequences = parseFASTA(text);
        console.log('[Upload] Parsed sequences:', sequences?.length, 'Type:', Array.isArray(sequences));
        
        if (!Array.isArray(sequences) || sequences.length === 0) {
          console.error('[Upload] No valid sequences parsed');
          showToast(`No valid sequences found in ${file.name}`, 'error');
          continue;
        }
        
        addSequences(sequences as any);
        console.log('[Upload] Added to store, total now:', useAppStore.getState().sequences.length);
        showToast(`✓ ${sequences.length} sequences loaded from ${file.name}`, 'success');
        
      } catch (error) {
        console.error('[Upload] Failed:', error);
        showToast(`✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      const validFiles = filesArray.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return allowedExtensions.includes(extension) && file.size <= maxSizeMB * 1024 * 1024;
      });
      if (validFiles.length > 0) {
        handleDropDebug(validFiles);
      }
    }
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return allowedExtensions.includes(extension) && file.size <= maxSizeMB * 1024 * 1024;
      });
      if (validFiles.length > 0) {
        handleDropDebug(validFiles);
      }
    }
    validateAndProcessFiles(e.target.files);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 scale-[1.01]'
            : 'border-teal-300 dark:border-teal-800 hover:border-teal-400 hover:bg-teal-50/20 dark:hover:bg-slate-800/20'
        }`}
        id="file-dropzone-uploader"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".fasta,.fa,.seq,.txt,.ab1"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="p-4 bg-teal-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-full mb-4">
          <UploadCloud className="w-8 h-8 animate-pulse" />
        </div>

        <p className="text-base font-semibold text-teal-950 dark:text-teal-50 text-center">
          Drag and drop genomics files here or click to select
        </p>
        
        <p className="text-xs text-teal-700/80 dark:text-teal-400/80 text-center mt-2 font-medium">
          Supported Formats: .fasta, .fa, .seq, .txt, .ab1 (max {maxSizeMB}MB per file, {maxFiles} files max)
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
