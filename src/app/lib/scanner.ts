import { getDB } from './db';

export type ScanResultType = 'MOTORCYCLE' | 'PRODUCT' | 'AMBIGUOUS' | 'NOT_FOUND';

export interface ScanResult {
  type: ScanResultType;
  code: string;
  motorcycleId?: string;
  productId?: string;
  ambiguousOptions?: {
    motorcycleId?: string;
    productId?: string;
  };
}

export async function scanResolve(code: string): Promise<ScanResult> {
  const db = await getDB();

  // Check if it's a motorcycle code (moto:MT-000001 or MT-000001)
  const motorcycleMatch = code.match(/(?:moto:)?(MT-\d{6})/i);
  if (motorcycleMatch) {
    const shopCode = motorcycleMatch[1].toUpperCase();
    const motorcycle = await db.getFromIndex('motorcycles', 'by-shopCode', shopCode);
    
    if (motorcycle) {
      return {
        type: 'MOTORCYCLE',
        code: shopCode,
        motorcycleId: motorcycle.id,
      };
    }
  }

  // Check if it's a product code (prod:<SKU> or plain SKU/EAN)
  const productMatch = code.match(/(?:prod:)?(.+)/);
  if (productMatch) {
    const identifier = productMatch[1];
    
    // Try SKU first
    let product = await db.getFromIndex('parts', 'by-sku', identifier);
    
    // Try EAN if SKU not found
    if (!product && identifier) {
      const cursor = await db.transaction('parts').store.index('by-ean').openCursor(identifier);
      if (cursor) {
        product = cursor.value;
      }
    }

    // Check for ambiguous case (both motorcycle and product exist)
    const motorcycle = await db.getFromIndex('motorcycles', 'by-shopCode', identifier.toUpperCase());
    
    if (product && motorcycle) {
      return {
        type: 'AMBIGUOUS',
        code: identifier,
        ambiguousOptions: {
          motorcycleId: motorcycle.id,
          productId: product.id,
        },
      };
    }

    if (product) {
      return {
        type: 'PRODUCT',
        code: identifier,
        productId: product.id,
      };
    }

    if (motorcycle) {
      return {
        type: 'MOTORCYCLE',
        code: identifier,
        motorcycleId: motorcycle.id,
      };
    }
  }

  return {
    type: 'NOT_FOUND',
    code,
  };
}

export function playBeep(success: boolean = true) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = success ? 800 : 400;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

export function vibrate(pattern: number | number[] = 200) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
