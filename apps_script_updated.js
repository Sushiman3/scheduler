// UPDATED Google Apps Script - Replace your existing script with this
// This version properly normalizes date formats

const PROFILES_SHEET = 'profiles';
const SCHEDULES_SHEET = 'schedules';

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const action = e.parameter.action;
    let result;

    try {
        switch (action) {
            case 'getProfiles':
                result = getProfiles();
                break;
            case 'getSchedules':
                result = getSchedules();
                break;
            case 'addProfile':
                result = addProfile(JSON.parse(e.postData.contents));
                break;
            case 'updateSchedule':
                result = updateSchedule(JSON.parse(e.postData.contents));
                break;
            case 'deleteProfile':
                result = deleteProfile(e.parameter.profileId);
                break;
            case 'cleanDuplicates':
                result = cleanDuplicates();
                break;
            default:
                result = { error: 'Unknown action' };
        }
    } catch (err) {
        result = { error: err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// Helper to normalize date to YYYY-MM-DD format
function normalizeDate(dateValue) {
    if (!dateValue) return null;

    // If already in YYYY-MM-DD format, return as-is
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }

    // Try to parse as date
    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        // Fall through
    }

    return String(dateValue);
}

function getProfiles() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROFILES_SHEET);
    const data = sheet.getDataRange().getValues();
    const profiles = [];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            profiles.push({
                id: String(data[i][0]),
                name: String(data[i][1]),
                color: String(data[i][2])
            });
        }
    }
    return { profiles };
}

function getSchedules() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCHEDULES_SHEET);
    const data = sheet.getDataRange().getValues();
    const schedules = {};

    for (let i = 1; i < data.length; i++) {
        const profileId = String(data[i][0]);
        const rawDate = data[i][1];
        const status = String(data[i][2]);

        if (profileId && rawDate) {
            // Normalize date to YYYY-MM-DD
            const date = normalizeDate(rawDate);

            if (!schedules[profileId]) schedules[profileId] = {};

            // Only keep the latest entry for each date (overwrite duplicates)
            schedules[profileId][date] = status;
        }
    }
    return { schedules };
}

function addProfile(profile) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROFILES_SHEET);
    sheet.appendRow([profile.id, profile.name, profile.color]);
    return { success: true, profile };
}

function updateSchedule(data) {
    const { profileId, scheduleData } = data;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCHEDULES_SHEET);
    const allData = sheet.getDataRange().getValues();

    // Find and delete ALL existing entries for this profile (regardless of date format)
    const rowsToDelete = [];
    for (let i = allData.length - 1; i >= 1; i--) {
        if (String(allData[i][0]) === profileId) {
            rowsToDelete.push(i + 1); // 1-indexed row number
        }
    }

    // Delete rows from bottom to top to preserve row numbers
    for (const row of rowsToDelete) {
        sheet.deleteRow(row);
    }

    // Add new entries with normalized dates
    const entries = Object.entries(scheduleData).filter(([_, status]) => status !== 'unset');
    entries.forEach(([date, status]) => {
        const normalizedDate = normalizeDate(date);
        sheet.appendRow([profileId, normalizedDate, status]);
    });

    return { success: true };
}

function deleteProfile(profileId) {
    // Delete from profiles
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROFILES_SHEET);
    let data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === profileId) {
            sheet.deleteRow(i + 1);
        }
    }

    // Delete from schedules
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCHEDULES_SHEET);
    data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
        if (String(data[i][0]) === profileId) {
            sheet.deleteRow(i + 1);
        }
    }

    return { success: true };
}

// Utility function to clean up duplicate entries
function cleanDuplicates() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCHEDULES_SHEET);
    const data = sheet.getDataRange().getValues();

    const seen = new Map(); // key: "profileId|normalizedDate" -> row number
    const rowsToDelete = [];

    for (let i = 1; i < data.length; i++) {
        const profileId = String(data[i][0]);
        const rawDate = data[i][1];
        const normalizedDate = normalizeDate(rawDate);
        const key = `${profileId}|${normalizedDate}`;

        if (seen.has(key)) {
            // This is a duplicate - mark the older one for deletion
            rowsToDelete.push(seen.get(key));
        }
        seen.set(key, i + 1); // Keep the latest (current row)
    }

    // Delete rows from bottom to top
    rowsToDelete.sort((a, b) => b - a);
    for (const row of rowsToDelete) {
        sheet.deleteRow(row);
    }

    return { success: true, deletedRows: rowsToDelete.length };
}
