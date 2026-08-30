import "dotenv/config";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/* ================================
   CONFIGURATION
================================ */

const API_URL = "https://encora.it/api/collection";
const API_KEY = process.env.ENCORA_API_KEY;

/* ================================
   CHECK API KEY
================================ */

if (!API_KEY) {
    console.error(
        "ERROR: ENCORA_API_KEY is not set."
    );

    console.error(
        "Check your .env file."
    );

    process.exit(1);
}

/* ================================
   FIND PROJECT DIRECTORY
================================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(
    __dirname,
    ".."
);

const OUTPUT_PATH = path.join(
    PROJECT_ROOT,
    "data",
    "collection.json"
);

/* ================================
   FETCH ONE PAGE
================================ */

async function fetchPage(page) {
    const url = new URL(API_URL);

    url.searchParams.set(
        "per_page",
        "100"
    );

    url.searchParams.set(
        "page",
        String(page)
    );

    console.log(
        `Fetching Encora page ${page}...`
    );

    const response = await fetch(
        url,
        {
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${API_KEY}`,

                "Content-Type":
                    "application/json",

                Accept:
                    "application/json"
            }
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        console.error(
            `Encora API returned HTTP ${response.status}`
        );

        console.error(errorText);

        throw new Error(
            `Failed to fetch Encora page ${page}`
        );
    }

    return await response.json();
}

/* ================================
   FETCH ENTIRE COLLECTION
================================ */

async function fetchEntireCollection() {
    console.log("");
    console.log(
        "================================="
    );
    console.log(
        "Fetching Encora collection"
    );
    console.log(
        "================================="
    );
    console.log("");

    const firstPage =
        await fetchPage(1);

    const allRecordings = [
        ...(firstPage.data || [])
    ];

    const totalPages =
        Number(
            firstPage.last_page || 1
        );

    const totalRecords =
        Number(
            firstPage.total ||
            allRecordings.length
        );

    console.log("");

    console.log(
        `Total recordings: ${totalRecords}`
    );

    console.log(
        `Total pages: ${totalPages}`
    );

    console.log("");

    for (
        let page = 2;
        page <= totalPages;
        page++
    ) {
        const pageData =
            await fetchPage(page);

        allRecordings.push(
            ...(pageData.data || [])
        );

        console.log(
            `Collected ${allRecordings.length} / ${totalRecords}`
        );
    }

    console.log("");

    console.log(
        "================================="
    );

    console.log(
        "Finished fetching collection"
    );

    console.log(
        "================================="
    );

    console.log("");

    return allRecordings;
}

/* ================================
   CREATE WEBSITE DATA
================================ */

function createWebsiteCollection(
    recordings
) {
    const cleanItems =
        recordings.map(
            item => {

                /*
                    The Encora collection response
                    contains the actual recording
                    inside item.recording.
                */

                const recording =
                    item.recording || {};

                const metadata =
                    recording.metadata || {};

                /*
                    IMPORTANT DATE HANDLING

                    Keep the COMPLETE Encora date
                    object.

                    DO NOT use only:

                    recording.date.full_date

                    because that would remove
                    Encora's month_known and
                    day_known information.
                */

                const date =
                    recording.date || null;

                return {

                    /* =========================
                       BASIC RECORDING DATA
                    ========================= */

                    id:
                        recording.id ??
                        item.id ??
                        null,

                    show:
                        recording.show ??
                        item.show ??
                        null,

                    tour:
                        recording.tour ??
                        item.tour ??
                        null,

                    /* =========================
                       COMPLETE ENCORA DATE
                    ========================= */

                    date:

                        date && typeof date === "object"

                            ? {
                                full_date:
                                    date.full_date ??
                                    null,

                                month_known:
                                    date.month_known ??
                                    null,

                                day_known:
                                    date.day_known ??
                                    null,

                                date_variant:
                                    date.date_variant ??
                                    null,

                                time:
                                    date.time ??
                                    null
                            }

                            : date,

                    /*
                        Keep time separately too,
                        for compatibility with any
                        existing website code.
                    */

                    time:
                        date?.time ??
                        item.time ??
                        null,

                    /* =========================
                       TRADING INFORMATION
                    ========================= */

                    master:
                        recording.master ??
                        item.master ??
                        null,

                    mediaType:
                        metadata.media_type ??
                        item.mediaType ??
                        null,

                    recordingType:
                        metadata.recording_type ??
                        item.recordingType ??
                        null,

                    amountRecorded:
                        metadata.amount_recorded ??
                        item.amountRecorded ??
                        null,

                    /*
                        Encora's API example uses
                        release_format.

                        Keep item.format as a fallback
                        for compatibility.
                    */

                    format:
                        recording.release_format ??
                        item.format ??
                        null,

                    /* =========================
                       LOCATION
                    ========================= */

                    venue:
                        metadata.venue ??
                        item.venue ??
                        null,

                    city:
                        metadata.city ??
                        item.city ??
                        null,

                    /* =========================
                       STATUS
                    ========================= */

                    giftingStatus:
                        metadata.gifting_status ??
                        item.giftingStatus ??
                        null,

                    limitedStatus:
                        metadata.limited_status ??
                        item.limitedStatus ??
                        null,

                    /* =========================
                       OWNERS / WANTERS
                    ========================= */

                    owners:
                        metadata.owners_count ??
                        0,

                    wanters:
                        metadata.wanters_count ??
                        0,

                    /* =========================
                       NOTES
                    ========================= */

                    notes:
                        recording.notes ??
                        item.notes ??
                        null,

                    /* =========================
                       CAST
                    ========================= */

                    cast:
                        Array.isArray(
                            recording.cast
                        )
                            ? recording.cast
                            : [],

                    /* =========================
                       UPDATE INFORMATION
                    ========================= */

                    updatedAt:
                        item.updated_at ??
                        recording.metadata?.last_updated ??
                        null,

                    collectedAt:
                        item.collected_at ??
                        null
                };
            }
        );

    return {
        total:
            cleanItems.length,

        items:
            cleanItems
    };
}

/* ================================
   SAVE COLLECTION
================================ */

async function saveCollection(
    collection
) {
    await fs.mkdir(
        path.dirname(
            OUTPUT_PATH
        ),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        OUTPUT_PATH,

        JSON.stringify(
            collection,
            null,
            2
        ),

        "utf-8"
    );

    console.log("");

    console.log(
        `Saved ${collection.total} recordings.`
    );

    const recordingsWithCast =
        collection.items.filter(
            recording =>
                Array.isArray(
                    recording.cast
                ) &&
                recording.cast.length > 0
        );

    console.log(
        `Recordings containing cast: ${recordingsWithCast.length}`
    );

    console.log(
        `Saved to: ${OUTPUT_PATH}`
    );

    console.log("");
}

/* ================================
   MAIN
================================ */

async function main() {
    try {

        const recordings =
            await fetchEntireCollection();

        const collection =
            createWebsiteCollection(
                recordings
            );

        await saveCollection(
            collection
        );

        console.log(
            "Encora update completed successfully."
        );

    } catch (error) {

        console.error("");

        console.error(
            "================================="
        );

        console.error(
            "ENCORA UPDATE FAILED"
        );

        console.error(
            "================================="
        );

        console.error("");

        console.error(error);

        process.exit(1);
    }
}

main();