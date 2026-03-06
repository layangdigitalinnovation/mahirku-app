# Dokumentasi Perancangan Integrasi Scan Sidik Jari
# DigitalPersona U.are.U 4500 — Tes Cognitive Style

> **Versi**: 1.0.0  
> **Tanggal**: 1 Maret 2026  
> **Project**: Mahirku — Platform Tes Gaya Kognitif  
> **Stack**: Node.js/Express/TypeScript (Backend) + Vite/React/TypeScript (Frontend)

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Analisis Sistem yang Sudah Ada](#2-analisis-sistem-yang-sudah-ada)
3. [Arsitektur Integrasi DigitalPersona 4500](#3-arsitektur-integrasi-digitalpersona-4500)
4. [Komponen Middleware (Local Agent)](#4-komponen-middleware-local-agent)
5. [Perancangan Backend API](#5-perancangan-backend-api)
6. [Perancangan Frontend Web](#6-perancangan-frontend-web)
7. [Database Schema & Migrasi](#7-database-schema--migrasi)
8. [Alur Kerja (User Flow)](#8-alur-kerja-user-flow)
9. [Spesifikasi API Endpoint](#9-spesifikasi-api-endpoint)
10. [Keamanan & Privasi Data](#10-keamanan--privasi-data)
11. [Panduan Instalasi & Setup](#11-panduan-instalasi--setup)
12. [Troubleshooting](#12-troubleshooting)
13. [Roadmap Pengembangan](#13-roadmap-pengembangan)

---

## 1. Ringkasan Eksekutif

### 1.1 Tujuan

Mengintegrasikan perangkat **DigitalPersona U.are.U 4500 Fingerprint Reader** ke dalam frontend web Mahirku untuk melakukan scan sidik jari sebagai bagian dari **Tes Cognitive Style (Gaya Kognitif)**. Saat ini fitur ini hanya tersedia di aplikasi mobile — dokumen ini merancang agar fitur tersebut juga dapat diakses melalui browser web.

### 1.2 Latar Belakang

Sistem Mahirku saat ini sudah memiliki:
- **Model `ThinkingStyle`** — menyimpan 9 tipe gaya berpikir berdasarkan digit numerologi (1-9)
- **Model `ThinkingStyleResult`** — menyimpan hasil tes dengan field `fingerprintId` (opsional)
- **Model `BiometricKey` & `BiometricChallenge`** — untuk autentikasi biometrik mobile
- **Halaman `CognitiveTest.tsx`** — saat ini menampilkan modal redirect ke mobile app

### 1.3 Tantangan Utama

Browser **tidak memiliki akses langsung** ke perangkat fingerprint USB. Diperlukan **middleware lokal** (local agent) yang berjalan di komputer client sebagai perantara antara browser dan perangkat DigitalPersona 4500.

### 1.4 Solusi Arsitektur

```
┌─────────────────────┐     WebSocket      ┌──────────────────────┐     USB/SDK     ┌──────────────────┐
│   Frontend Web      │ ◄──────────────►   │   Local Agent        │ ◄─────────────► │  DigitalPersona  │
│   (React/Vite)      │   ws://127.0.0.1   │   (Windows Service)  │   DPFP SDK      │  U.are.U 4500    │
└────────┬────────────┘                    └──────────────────────┘                 └──────────────────┘
         │ HTTPS REST API
         ▼
┌─────────────────────┐
│   Backend API       │
│   (Express/Node.js) │
│   PostgreSQL DB     │
└─────────────────────┘
```

---

## 2. Analisis Sistem yang Sudah Ada

### 2.1 Struktur Backend

```
backend/src/
├── app.ts                              # Express app, semua routes terdaftar
├── server.ts                           # Server entry point
├── config/                             # Konfigurasi database
├── controllers/
│   ├── thinkingStyleController.ts      # Submit tes, history, PDF
│   ├── biometricController.ts          # Register key, challenge, verify
│   └── adminThinkingStyleController.ts # Admin CRUD thinking styles
├── models/
│   ├── ThinkingStyle.ts                # Tipe gaya berpikir (digit 1-9)
│   ├── ThinkingStyleResult.ts          # Hasil tes (ada field fingerprintId)
│   ├── BiometricKey.ts                 # Public key biometrik per user/device
│   ├── BiometricChallenge.ts           # Challenge untuk verifikasi
│   └── User.ts                        # Model user dengan tokens
├── routes/
│   ├── thinkingStyleRoutes.ts          # POST /submit, GET /history, GET /pdf/:id
│   └── biometricRoutes.ts             # POST /register-key, GET /challenge, POST /verify
└── middlewares/
    └── authMiddleware.ts               # JWT authentication
```

### 2.2 Struktur Frontend

```
frontend/src/
├── pages/
│   ├── CognitiveStyleLanding.tsx       # Landing page tes kognitif
│   └── Test/
│       ├── CognitiveTest.tsx           # Halaman pemilihan tes (redirect ke mobile)
│       ├── TestResult.tsx              # Halaman hasil tes
│       └── ThinkingStyleDetailPage.tsx # Detail gaya berpikir
├── services/api/
│   ├── thinkingStyles.ts              # API calls ke thinking-style endpoints
│   └── index.ts                       # Re-export semua API services
├── components/ui/                     # Komponen UI (shadcn/radix)
└── hooks/                             # Custom React hooks
```

### 2.3 Alur Tes Saat Ini

1. User login → buka halaman `CognitiveTest.tsx`
2. Klik "Tes Gaya Kognitif" → muncul **modal redirect ke mobile app**
3. Di mobile: scan sidik jari → kirim `fingerprintId` + `birthdate` ke API
4. Backend: hitung digit dari `birthdate` → cari `ThinkingStyle` berdasarkan digit
5. Simpan ke `ThinkingStyleResult` → kurangi token user

### 2.4 Yang Perlu Dikembangkan

| Komponen | Status Saat Ini | Yang Perlu Ditambahkan |
|---|---|---|
| Frontend Web | Redirect ke mobile | Halaman scan sidik jari langsung |
| Local Agent | Belum ada | Middleware WebSocket + DigitalPersona SDK |
| Backend API | Sudah ada `/submit` | Endpoint baru untuk fingerprint data |
| Database | `fingerprintId` string | Model baru `FingerprintScan` |

---

## 3. Arsitektur Integrasi DigitalPersona 4500

### 3.1 Diagram Arsitektur Lengkap

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KOMPUTER CLIENT                              │
│                                                                     │
│  ┌──────────────────────┐          ┌────────────────────────────┐  │
│  │  Browser (Chrome)     │          │  Mahirku Fingerprint Agent │  │
│  │  ┌────────────────┐  │  WS/WSS  │  ┌──────────────────────┐ │  │
│  │  │ React Frontend │◄─┼──────────┼─►│  WebSocket Server    │ │  │
│  │  │                │  │          │  │  (ws://127.0.0.1:    │ │  │
│  │  │ FingerprintScan│  │          │  │       9876)           │ │  │
│  │  │ Component      │  │          │  └──────────┬───────────┘ │  │
│  │  └────────────────┘  │          │             │             │  │
│  └──────────────────────┘          │  ┌──────────▼───────────┐ │  │
│                                    │  │  DigitalPersona      │ │  │
│                                    │  │  DPFP SDK / U.are.U  │ │  │
│                                    │  │  RTE Library         │ │  │
│                                    │  └──────────┬───────────┘ │  │
│                                    └─────────────┼─────────────┘  │
│                                                  │ USB            │
│                                    ┌─────────────▼─────────────┐  │
│                                    │  DigitalPersona U.are.U   │  │
│                                    │  4500 Fingerprint Reader  │  │
│                                    └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                        │
                        │ HTTPS REST API
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVER (VPS/Cloud)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Backend API (Express/Node.js)                              │   │
│  │  ├── POST /api/fingerprint/capture     ← Simpan data scan  │   │
│  │  ├── POST /api/thinking-style/submit   ← Submit tes        │   │
│  │  └── GET  /api/thinking-style/history  ← Ambil riwayat     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                      │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │  PostgreSQL Database                                        │   │
│  │  ├── thinking_styles          (9 tipe gaya berpikir)        │   │
│  │  ├── thinking_style_results   (hasil tes + fingerprintId)   │   │
│  │  ├── fingerprint_scans   [BARU] (data scan sidik jari)      │   │
│  │  └── users                    (user dengan token)           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Teknologi yang Digunakan

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Hardware** | DigitalPersona U.are.U 4500 | USB Fingerprint Reader, 512 DPI optical |
| **Driver** | U.are.U RTE (Runtime Environment) | Driver resmi, wajib install di client |
| **SDK** | DPFP SDK / U.are.U SDK | Library untuk capture & proses fingerprint |
| **Local Agent** | C# .NET 6+ atau Python | Windows Service dengan WebSocket server |
| **WebSocket** | ws://127.0.0.1:9876 | Komunikasi browser ↔ local agent |
| **Frontend** | React + TypeScript + TailwindCSS | UI scan fingerprint |
| **Backend** | Express + TypeScript + Sequelize | API endpoint & database |
| **Database** | PostgreSQL | Penyimpanan data fingerprint |

---

## 4. Komponen Middleware (Local Agent)

### 4.1 Apa itu Local Agent?

Local Agent adalah aplikasi desktop ringan yang berjalan di background pada komputer client. Fungsinya:
1. Berkomunikasi dengan perangkat DigitalPersona 4500 via USB (menggunakan SDK)
2. Menyediakan WebSocket server di `localhost` untuk menerima perintah dari browser
3. Mengirim data hasil scan (image + template) ke browser via WebSocket

### 4.2 Pilihan Teknologi Local Agent

#### Opsi A: C# / .NET (Direkomendasikan untuk Windows)

**Kelebihan:**
- SDK DigitalPersona punya binding C# native
- Mudah dibuat sebagai Windows Service
- Performance tinggi

**Struktur Project:**

```
MahirkuFingerprintAgent/
├── MahirkuFingerprintAgent.sln
├── Program.cs                      # Entry point
├── Services/
│   ├── WebSocketService.cs         # WebSocket server (ws://127.0.0.1:9876)
│   ├── FingerprintCaptureService.cs # Interface ke DPFP SDK
│   └── MessageHandler.cs          # Handle pesan dari browser
├── Models/
│   ├── CaptureResult.cs            # Model hasil capture
│   └── WebSocketMessage.cs         # Model pesan WebSocket
└── appsettings.json                # Konfigurasi (port, dll)
```

**Contoh Kode `FingerprintCaptureService.cs`:**

```csharp
using DPFP;
using DPFP.Capture;

public class FingerprintCaptureService : DPFP.Capture.EventHandler
{
    private DPFP.Capture.Capture _capturer;
    private Action<CaptureResult> _onCaptured;

    public void StartCapture(Action<CaptureResult> onCaptured)
    {
        _onCaptured = onCaptured;
        _capturer = new DPFP.Capture.Capture();
        _capturer.EventHandler = this;
        _capturer.StartCapture();
    }

    public void StopCapture()
    {
        _capturer?.StopCapture();
        _capturer?.Dispose();
    }

    // Callback saat sidik jari berhasil di-scan
    public void OnComplete(object capture, string readerSerialNumber, Sample sample)
    {
        // 1. Konversi sample ke gambar PNG
        var converter = new SampleConversion();
        Bitmap bitmap = null;
        converter.ConvertToPicture(sample, ref bitmap);

        using var ms = new MemoryStream();
        bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
        string imageBase64 = Convert.ToBase64String(ms.ToArray());

        // 2. Ekstrak fingerprint template
        var extractor = new DPFP.Processing.FeatureExtraction();
        var features = new DPFP.FeatureSet();
        extractor.CreateFeatureSet(sample,
            DPFP.Processing.DataPurpose.Verification,
            ref features);

        // 3. Hitung kualitas scan
        int quality = CalculateQuality(sample);

        // 4. Kirim hasil ke callback
        _onCaptured?.Invoke(new CaptureResult
        {
            ImageBase64 = imageBase64,
            TemplateBase64 = Convert.ToBase64String(features.Bytes),
            Quality = quality,
            Timestamp = DateTime.UtcNow
        });
    }

    public void OnFingerGone(object capture, string readerSerialNumber) { }
    public void OnFingerTouch(object capture, string readerSerialNumber) { }
    public void OnReaderConnect(object capture, string readerSerialNumber) { }
    public void OnReaderDisconnect(object capture, string readerSerialNumber) { }
    public void OnSampleQuality(object capture, string readerSerialNumber,
        CaptureFeedback feedback) { }
}
```

**Contoh Kode `WebSocketService.cs`:**

```csharp
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WebSocketService
{
    private HttpListener _httpListener;
    private FingerprintCaptureService _captureService;
    private List<WebSocket> _clients = new();
    private const int PORT = 9876;

    public async Task StartAsync()
    {
        _captureService = new FingerprintCaptureService();
        _httpListener = new HttpListener();
        _httpListener.Prefixes.Add($"http://127.0.0.1:{PORT}/");
        _httpListener.Start();

        Console.WriteLine($"Mahirku Fingerprint Agent running on ws://127.0.0.1:{PORT}");

        while (true)
        {
            var context = await _httpListener.GetContextAsync();
            if (context.Request.IsWebSocketRequest)
            {
                var wsContext = await context.AcceptWebSocketAsync(null);
                _ = HandleClientAsync(wsContext.WebSocket);
            }
        }
    }

    private async Task HandleClientAsync(WebSocket ws)
    {
        _clients.Add(ws);
        var buffer = new byte[4096];

        try
        {
            while (ws.State == WebSocketState.Open)
            {
                var result = await ws.ReceiveAsync(buffer, CancellationToken.None);
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                var command = JsonSerializer.Deserialize<WebSocketMessage>(message);

                switch (command.Type)
                {
                    case "start_capture":
                        _captureService.StartCapture(async (captureResult) =>
                        {
                            var response = JsonSerializer.Serialize(new
                            {
                                type = "fingerprint_captured",
                                image = captureResult.ImageBase64,
                                template = captureResult.TemplateBase64,
                                quality = captureResult.Quality,
                                timestamp = captureResult.Timestamp
                            });
                            await BroadcastAsync(response);
                        });
                        await SendAsync(ws, "{\"type\":\"capture_started\"}");
                        break;

                    case "stop_capture":
                        _captureService.StopCapture();
                        await SendAsync(ws, "{\"type\":\"capture_stopped\"}");
                        break;

                    case "check_reader":
                        // Cek apakah reader terhubung
                        await SendAsync(ws, JsonSerializer.Serialize(new
                        {
                            type = "reader_status",
                            connected = true, // Implementasi cek device
                            deviceName = "DigitalPersona U.are.U 4500"
                        }));
                        break;
                }
            }
        }
        finally
        {
            _clients.Remove(ws);
        }
    }

    private async Task SendAsync(WebSocket ws, string message)
    {
        var bytes = Encoding.UTF8.GetBytes(message);
        await ws.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
    }

    private async Task BroadcastAsync(string message)
    {
        foreach (var client in _clients.Where(c => c.State == WebSocketState.Open))
        {
            await SendAsync(client, message);
        }
    }
}
```

#### Opsi B: Python (Alternatif)

```python
# mahirku_fingerprint_agent.py
import asyncio
import websockets
import json
import base64
from pyfingerprint.pyfingerprint import PyFingerprint

# Catatan: Library pyfingerprint mungkin tidak mendukung DP 4500 secara langsung.
# Untuk DP 4500, gunakan SDK C# atau wrapper ctypes ke DLL DigitalPersona.
```

> **⚠️ Rekomendasi:** Gunakan **C# .NET** karena SDK DigitalPersona memiliki dukungan native C# terbaik.

### 4.3 Protokol WebSocket

#### Pesan dari Browser → Agent

```json
// Mulai capture
{ "type": "start_capture" }

// Stop capture
{ "type": "stop_capture" }

// Cek status reader
{ "type": "check_reader" }

// Ping (keep-alive)
{ "type": "ping" }
```

#### Pesan dari Agent → Browser

```json
// Reader status
{
  "type": "reader_status",
  "connected": true,
  "deviceName": "DigitalPersona U.are.U 4500"
}

// Capture dimulai
{ "type": "capture_started" }

// Jari terdeteksi (touch)
{ "type": "finger_touch" }

// Jari diangkat
{ "type": "finger_gone" }

// Sidik jari berhasil ditangkap
{
  "type": "fingerprint_captured",
  "image": "<base64_png_image>",
  "template": "<base64_fingerprint_template>",
  "quality": 85,
  "timestamp": "2026-03-01T10:30:00Z"
}

// Error
{
  "type": "error",
  "message": "Reader disconnected",
  "code": "READER_DISCONNECTED"
}

// Kualitas scan buruk
{
  "type": "quality_feedback",
  "message": "Letakkan jari lebih rata pada sensor",
  "code": "MOVE_FINGER_DOWN"
}
```

---

## 5. Perancangan Backend API

### 5.1 File Baru yang Perlu Dibuat

#### `backend/src/models/FingerprintScan.ts`

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface FingerprintScanAttributes {
  id: number;
  userId: number;
  thinkingStyleResultId?: number;
  imageData: string;        // base64 PNG gambar sidik jari
  templateData: string;     // base64 fingerprint template
  quality: number;          // kualitas scan (0-100)
  fingerIndex?: string;     // jari mana (right_thumb, left_index, dll)
  scanMethod: string;       // 'digitalpersona_4500' | 'mobile_biometric'
  createdAt?: Date;
  updatedAt?: Date;
}

interface FingerprintScanCreationAttributes
  extends Optional<FingerprintScanAttributes, 'id' | 'thinkingStyleResultId' | 'fingerIndex' | 'createdAt' | 'updatedAt'> {}

class FingerprintScan extends Model<FingerprintScanAttributes, FingerprintScanCreationAttributes>
  implements FingerprintScanAttributes {
  public id!: number;
  public userId!: number;
  public thinkingStyleResultId!: number;
  public imageData!: string;
  public templateData!: string;
  public quality!: number;
  public fingerIndex!: string;
  public scanMethod!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FingerprintScan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID user yang melakukan scan',
    },
    thinkingStyleResultId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Relasi ke hasil tes thinking style',
    },
    imageData: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Base64 encoded PNG image sidik jari',
    },
    templateData: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Base64 encoded fingerprint template',
    },
    quality: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 100 },
      comment: 'Kualitas scan 0-100',
    },
    fingerIndex: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Jari: right_thumb, right_index, left_thumb, dll',
    },
    scanMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'digitalpersona_4500',
      comment: 'Metode scan: digitalpersona_4500, mobile_biometric',
    },
  },
  {
    sequelize,
    tableName: 'fingerprint_scans',
    modelName: 'FingerprintScan',
    timestamps: true,
  }
);

export default FingerprintScan;
```

#### `backend/src/controllers/fingerprintController.ts`

```typescript
import { Request, Response } from 'express';
import FingerprintScan from '../models/FingerprintScan';
import crypto from 'crypto';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Simpan hasil scan sidik jari
export const saveFingerprintScan = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.user;
    const { imageData, templateData, quality, fingerIndex, scanMethod } = req.body;

    if (!imageData || !templateData) {
      res.status(400).json({ message: 'Data sidik jari tidak lengkap' });
      return;
    }

    if (quality < 50) {
      res.status(400).json({ message: 'Kualitas scan terlalu rendah, minimal 50%' });
      return;
    }

    // Generate unique fingerprint ID
    const fingerprintId = crypto.randomUUID();

    const scan = await FingerprintScan.create({
      userId,
      imageData,
      templateData,
      quality,
      fingerIndex: fingerIndex || 'right_thumb',
      scanMethod: scanMethod || 'digitalpersona_4500',
    });

    res.status(201).json({
      message: 'Scan sidik jari berhasil disimpan',
      data: {
        id: scan.id,
        fingerprintId,
        quality: scan.quality,
        fingerIndex: scan.fingerIndex,
      },
    });
  } catch (err: any) {
    console.error('saveFingerprintScan error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Dapatkan riwayat scan user
export const getUserScans = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.user;
    const scans = await FingerprintScan.findAll({
      where: { userId },
      attributes: ['id', 'quality', 'fingerIndex', 'scanMethod', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ data: scans });
  } catch (err: any) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};
```

#### `backend/src/routes/fingerprintRoutes.ts`

```typescript
import { Router } from 'express';
import { saveFingerprintScan, getUserScans } from '../controllers/fingerprintController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/capture', authMiddleware, saveFingerprintScan);
router.get('/history', authMiddleware, getUserScans);

export default router;
```

### 5.2 Perubahan pada File yang Sudah Ada

#### Update `backend/src/app.ts`

Tambahkan route baru:

```typescript
// Tambahkan import
import fingerprintRoutes from './routes/fingerprintRoutes';

// Tambahkan route (setelah biometricRoutes)
app.use('/api/fingerprint', fingerprintRoutes);
```

#### Update `backend/src/controllers/thinkingStyleController.ts`

Modifikasi `submitThinkingStyleTest` untuk menerima data fingerprint dari web:

```typescript
// Di fungsi submitThinkingStyleTest, tambahkan parameter
const { fullname, birthdate, fingerprintId, referrerId, fingerprintScanId } = req.body;

// Jika ada fingerprintScanId, update relasi
if (fingerprintScanId) {
  await FingerprintScan.update(
    { thinkingStyleResultId: result.id },
    { where: { id: fingerprintScanId, userId } }
  );
}
```

---

## 6. Perancangan Frontend Web

### 6.1 File Baru yang Perlu Dibuat

```
frontend/src/
├── hooks/
│   └── useFingerprintScanner.ts        # [BARU] Custom hook WebSocket ke agent
├── services/api/
│   └── fingerprint.ts                  # [BARU] API calls ke fingerprint endpoint
├── components/fingerprint/
│   ├── FingerprintScanner.tsx          # [BARU] Komponen utama scanner
│   ├── ScannerStatus.tsx              # [BARU] Status koneksi reader
│   ├── FingerprintPreview.tsx         # [BARU] Preview gambar sidik jari
│   └── ScanQualityIndicator.tsx       # [BARU] Indikator kualitas scan
└── pages/Test/
    └── FingerprintCognitiveTest.tsx    # [BARU] Halaman tes lengkap
```

### 6.2 Custom Hook: `useFingerprintScanner.ts`

```typescript
// frontend/src/hooks/useFingerprintScanner.ts

import { useState, useEffect, useRef, useCallback } from 'react';

// Konfigurasi
const WS_URL = 'ws://127.0.0.1:9876';
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

// Types
export type ScannerStatus =
  | 'disconnected'    // Agent tidak terhubung
  | 'connecting'      // Sedang menghubungkan
  | 'connected'       // Agent terhubung, reader terdeteksi
  | 'no_reader'       // Agent terhubung, reader TIDAK terdeteksi
  | 'scanning'        // Sedang menunggu sidik jari
  | 'captured'        // Sidik jari berhasil ditangkap
  | 'error';          // Error

export interface FingerprintData {
  image: string;      // base64 PNG
  template: string;   // base64 fingerprint template
  quality: number;    // 0-100
  timestamp: string;
}

export interface UseFingerprintScannerReturn {
  status: ScannerStatus;
  fingerprintData: FingerprintData | null;
  error: string | null;
  readerInfo: { connected: boolean; deviceName: string } | null;
  isAgentInstalled: boolean;

  // Actions
  connect: () => void;
  disconnect: () => void;
  startCapture: () => void;
  stopCapture: () => void;
  resetCapture: () => void;
}

export function useFingerprintScanner(): UseFingerprintScannerReturn {
  const [status, setStatus] = useState<ScannerStatus>('disconnected');
  const [fingerprintData, setFingerprintData] = useState<FingerprintData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readerInfo, setReaderInfo] = useState<{ connected: boolean; deviceName: string } | null>(null);
  const [isAgentInstalled, setIsAgentInstalled] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsAgentInstalled(true);
        reconnectAttemptsRef.current = 0;
        // Cek status reader
        ws.send(JSON.stringify({ type: 'check_reader' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = () => {
        setError('Gagal terhubung ke Mahirku Fingerprint Agent');
        setStatus('error');
        setIsAgentInstalled(false);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        attemptReconnect();
      };
    } catch (err) {
      setStatus('error');
      setError('WebSocket tidak tersedia');
    }
  }, []);

  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'reader_status':
        setReaderInfo({ connected: data.connected, deviceName: data.deviceName });
        setStatus(data.connected ? 'connected' : 'no_reader');
        break;

      case 'capture_started':
        setStatus('scanning');
        break;

      case 'finger_touch':
        // Opsional: bisa tampilkan feedback visual
        break;

      case 'fingerprint_captured':
        setFingerprintData({
          image: data.image,
          template: data.template,
          quality: data.quality,
          timestamp: data.timestamp,
        });
        setStatus('captured');
        break;

      case 'quality_feedback':
        setError(data.message);
        break;

      case 'error':
        setError(data.message);
        setStatus('error');
        break;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) return;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, RECONNECT_INTERVAL);
  }, [connect]);

  const startCapture = useCallback(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    setFingerprintData(null);
    setError(null);
    wsRef.current.send(JSON.stringify({ type: 'start_capture' }));
  }, []);

  const stopCapture = useCallback(() => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'stop_capture' }));
    setStatus('connected');
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
    setStatus('disconnected');
  }, []);

  const resetCapture = useCallback(() => {
    setFingerprintData(null);
    setError(null);
    setStatus('connected');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, []);

  return {
    status,
    fingerprintData,
    error,
    readerInfo,
    isAgentInstalled,
    connect,
    disconnect,
    startCapture,
    stopCapture,
    resetCapture,
  };
}
```

### 6.3 API Service: `fingerprint.ts`

```typescript
// frontend/src/services/api/fingerprint.ts

import api from '@/utils/axios';

export interface SaveFingerprintRequest {
  imageData: string;
  templateData: string;
  quality: number;
  fingerIndex?: string;
  scanMethod?: string;
}

export interface SaveFingerprintResponse {
  id: number;
  fingerprintId: string;
  quality: number;
  fingerIndex: string;
}

export const saveFingerprintScan = async (data: SaveFingerprintRequest) => {
  const res = await api.post('fingerprint/capture', data);
  return res.data;
};

export const getFingerprintHistory = async () => {
  const res = await api.get('fingerprint/history');
  return res.data;
};
```

### 6.4 Komponen Utama: `FingerprintCognitiveTest.tsx` (Ringkasan)

Halaman ini menggabungkan seluruh flow:

**Step 1 — Koneksi**: Cek apakah agent terinstall, tampilkan status reader  
**Step 2 — Identitas**: Input nama lengkap dan tanggal lahir  
**Step 3 — Scan**: Tampilkan area scan, feedback real-time, preview sidik jari  
**Step 4 — Konfirmasi**: Review data sebelum submit  
**Step 5 — Hasil**: Tampilkan thinking style result

```typescript
// Pseudo-code alur komponen
const FingerprintCognitiveTest = () => {
  const [step, setStep] = useState(1);
  const scanner = useFingerprintScanner();
  const submitMutation = useMutation(submitThinkingStyleTest);

  // Step 1: Connect ke agent
  // Step 2: Form nama + tanggal lahir
  // Step 3: Scan sidik jari (gunakan scanner.startCapture())
  // Step 4: Kirim data: { fullname, birthdate, fingerprintId, scanData }
  // Step 5: Tampilkan hasil
};
```

---

## 7. Database Schema & Migrasi

### 7.1 Tabel Baru: `fingerprint_scans`

```sql
CREATE TABLE fingerprint_scans (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "thinkingStyleResultId" INTEGER REFERENCES thinking_style_results(id),
  "imageData" TEXT NOT NULL,
  "templateData" TEXT NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 100),
  "fingerIndex" VARCHAR(50) DEFAULT 'right_thumb',
  "scanMethod" VARCHAR(50) NOT NULL DEFAULT 'digitalpersona_4500',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fingerprint_scans_user ON fingerprint_scans ("userId");
CREATE INDEX idx_fingerprint_scans_result ON fingerprint_scans ("thinkingStyleResultId");
```

### 7.2 Migration File Sequelize

Buat file: `backend/src/migrations/XXXXXX-create-fingerprint-scans.js`

```javascript
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fingerprint_scans', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      thinkingStyleResultId: { type: Sequelize.INTEGER, allowNull: true },
      imageData: { type: Sequelize.TEXT, allowNull: false },
      templateData: { type: Sequelize.TEXT, allowNull: false },
      quality: { type: Sequelize.INTEGER, allowNull: false },
      fingerIndex: { type: Sequelize.STRING(50), defaultValue: 'right_thumb' },
      scanMethod: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'digitalpersona_4500' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex('fingerprint_scans', ['userId']);
    await queryInterface.addIndex('fingerprint_scans', ['thinkingStyleResultId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fingerprint_scans');
  },
};
```

---

## 8. Alur Kerja (User Flow)

### 8.1 Flow Diagram

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Login   │────►│ Pilih Tes    │────►│ Cek Koneksi  │────►│ Input Data   │────►│  Scan    │
│  Web     │     │ Gaya Kognitif│     │ Agent &      │     │ Nama +       │     │  Sidik   │
│          │     │              │     │ Reader       │     │ Ttl          │     │  Jari    │
└─────────┘     └──────────────┘     └──────┬───────┘     └──────────────┘     └────┬─────┘
                                            │                                       │
                                     Agent tidak ada?                         Berhasil?
                                            │                                       │
                                            ▼                                       ▼
                                    ┌──────────────┐                        ┌──────────────┐
                                    │ Tampilkan    │                        │ Konfirmasi   │
                                    │ Link Download│                        │ & Submit     │
                                    │ Agent        │                        │ ke Server    │
                                    └──────────────┘                        └──────┬───────┘
                                                                                   │
                                                                                   ▼
                                                                           ┌──────────────┐
                                                                           │ Tampilkan    │
                                                                           │ Hasil Tes    │
                                                                           │ Gaya Kognitif│
                                                                           └──────────────┘
```

### 8.2 Detail Setiap Step

| Step | Aksi User | Sistem | Error Handling |
|------|-----------|--------|----------------|
| 1 | Login dan navigasi ke tes | Cek token user | Redirect ke beli token jika 0 |
| 2 | Klik "Tes Gaya Kognitif" | Connect WebSocket ke agent | Tampilkan panduan install agent |
| 3 | Tunggu koneksi | Cek reader DP 4500 | Tampilkan "Hubungkan reader" |
| 4 | Input nama & tanggal lahir | Validasi form | Tampilkan pesan error |
| 5 | Letakkan jari pada reader | Capture fingerprint via SDK | Minta scan ulang jika quality < 50 |
| 6 | Review data | Kirim ke backend API | Retry jika gagal |
| 7 | Lihat hasil | Ambil ThinkingStyle result | - |

---

## 9. Spesifikasi API Endpoint

### 9.1 Endpoint Baru

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/fingerprint/capture` | Ya | `{imageData, templateData, quality, fingerIndex, scanMethod}` | `{id, fingerprintId, quality}` |
| GET | `/api/fingerprint/history` | Ya | - | `{data: FingerprintScan[]}` |

### 9.2 Endpoint yang Dimodifikasi

| Method | Endpoint | Perubahan |
|--------|----------|-----------|
| POST | `/api/thinking-style/submit` | Tambah field `fingerprintScanId` opsional |

---

## 10. Keamanan & Privasi Data

### 10.1 Prinsip Keamanan

1. **Data sidik jari sensitif** — simpan sebagai template (bukan raw image) di production
2. **WebSocket hanya localhost** — agent hanya listen di `127.0.0.1`, tidak bisa diakses dari luar
3. **HTTPS wajib** — komunikasi frontend ↔ backend harus melalui HTTPS
4. **Enkripsi template** — encrypt `templateData` sebelum simpan ke database
5. **Retention policy** — hapus `imageData` setelah tes selesai, simpan hanya `templateData`

### 10.2 Validasi Data

- Quality minimal 50% sebelum menerima scan
- Rate limiting: maksimal 10 scan per menit per user
- Validasi ukuran `imageData` (maks 500KB base64)
- Sanitasi semua input sebelum simpan ke database

---

## 11. Panduan Instalasi & Setup

### 11.1 Prasyarat di Komputer Client

| No | Software | Link Download | Keterangan |
|----|----------|---------------|------------|
| 1 | DigitalPersona U.are.U RTE | [HID Global](https://www.hidglobal.com/drivers) | Runtime/Driver wajib |
| 2 | Mahirku Fingerprint Agent | (Build sendiri) | Middleware WebSocket |
| 3 | Browser modern | Chrome/Edge/Firefox | Mendukung WebSocket |

### 11.2 Langkah Instalasi

```
1. Install driver DigitalPersona U.are.U RTE
2. Hubungkan perangkat DP 4500 via USB
3. Verifikasi di Device Manager → "DigitalPersona U.are.U 4500"
4. Install Mahirku Fingerprint Agent
5. Jalankan agent (otomatis saat startup)
6. Buka browser → akses web Mahirku → mulai tes
```

### 11.3 Untuk Developer

```bash
# Backend – tambah route baru
cd backend
# Buat migration
npx sequelize-cli migration:generate --name create-fingerprint-scans
# Jalankan migration
npm run migrate
# Jalankan server
npm run dev

# Frontend – tidak perlu dependency baru (WebSocket native browser)
cd frontend
npm run dev
```

---

## 12. Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|-------|
| "Agent tidak terdeteksi" | Mahirku Fingerprint Agent belum berjalan | Start agent dari system tray |
| "Reader tidak terhubung" | USB tidak terpasang / driver belum install | Cek USB, install RTE driver |
| "Kualitas scan rendah" | Jari kotor/basah/terlalu cepat | Bersihkan jari, tahan 2 detik |
| WebSocket error | Port 9876 diblokir firewall | Tambahkan exception di firewall |
| "Token tidak cukup" | Token user habis | Beli token paket |

---

## 13. Roadmap Pengembangan

### Phase 1: MVP (2-3 minggu)
- [x] Dokumentasi perancangan (dokumen ini)
- [ ] Buat Local Agent (C# .NET) dengan fitur dasar capture
- [ ] Buat model `FingerprintScan` dan migration
- [ ] Buat controller dan route fingerprint
- [ ] Buat halaman `FingerprintCognitiveTest.tsx`
- [ ] Buat custom hook `useFingerprintScanner.ts`
- [ ] Integrasi end-to-end testing

### Phase 2: Enhancement (2-3 minggu)
- [ ] Installer agent (MSI/EXE) untuk distribusi
- [ ] Auto-update agent
- [ ] Multi-finger scan support
- [ ] Enkripsi data fingerprint
- [ ] Fingerprint matching (verifikasi identitas)

### Phase 3: Advanced (1-2 bulan)
- [ ] Dermatoglyphics analysis (analisis pola sidik jari untuk cognitive style)
- [ ] Machine learning untuk klasifikasi pola
- [ ] Dashboard admin: monitoring scan
- [ ] Ekspor laporan PDF dengan gambar sidik jari
- [ ] Support macOS/Linux agent

---

> **Catatan**: Dokumen ini adalah panduan perancangan. Setiap bagian bisa dikembangkan lebih lanjut sesuai kebutuhan. Pastikan untuk melakukan **code review** dan **security audit** sebelum deploy ke production.
