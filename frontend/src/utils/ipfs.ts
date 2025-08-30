interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
      'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
  }

  const data: PinataResponse = await response.json();
  return data.IpfsHash;
}

export async function uploadMultipleFilesToIPFS(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadToIPFS(file));
  return Promise.all(uploadPromises);
}

export async function uploadJSONToIPFS(jsonData: any): Promise<string> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
      'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
    },
    body: JSON.stringify(jsonData),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload JSON to IPFS: ${response.statusText}`);
  }

  const data: PinataResponse = await response.json();
  return data.IpfsHash;
}

export function getIPFSGatewayURL(ipfsHash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}
