export interface QRReaderType {
  type: 'qr'
  labels: {
    button: string
    scannerDialogSupportingCopy: string
    tutorial: {
      cameraCleanliness: string
      distance: string
      lightBalance: string
    }
  }
}

// union of other reader types
export type ReaderType = QRReaderType

interface IDReader {
  dividerLabel: string
  manualInputInstructionLabel: string
  readers: [ReaderType, ...ReaderType[]] // at least one reader is needed to be provided
}

interface Scan {
  onScan: (code: Record<string, unknown>) => void
  onError: (error: 'mount' | 'parse') => void
}

export interface ScannableIDReader extends IDReader, Scan {}

export interface ScannableQRReader extends Omit<QRReaderType, 'type'>, Scan {}
