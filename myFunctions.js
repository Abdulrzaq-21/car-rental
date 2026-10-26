var vehicleInventory = [
  {
    code: 'CR-001',
    model: 'Toyota Corolla',
    year: 2023,
    dailyPrice: 2500,
    image: 'toyota-corolla.jpg',
    details: {
      fuel: 'بنزين',
      transmission: 'أوتوماتيك',
      seats: 5,
      odometer: 42000,
      color: 'أبيض'
    }
  },
  {
    code: 'CR-002',
    model: 'Kia Sportage',
    year: 2022,
    dailyPrice: 4000,
    image: 'kia-sportage.jpg',
    details: {
      fuel: 'ديزل',
      transmission: 'أوتوماتيك',
      seats: 5,
      odometer: 51000,
      color: 'رمادي'
    }
  },
  {
    code: 'CR-003',
    model: 'Hyundai Elantra',
    year: 2024,
    dailyPrice: 3000,
    image: 'hyundai-elantra.jpg',
    details: {
      fuel: 'بنزين',
      transmission: 'أوتوماتيك',
      seats: 5,
      odometer: 28000,
      color: 'أسود'
    }
  },
  {
    code: 'CR-004',
    model: 'Chevrolet Spark',
    year: 2021,
    dailyPrice: 1800,
    image: 'chevrolet-spark.jpg',
    details: {
      fuel: 'بنزين',
      transmission: 'يدوي',
      seats: 5,
      odometer: 63000,
      color: 'أحمر'
    }
  },
  {
    code: 'CR-005',
    model: 'Nissan Sunny',
    year: 2023,
    dailyPrice: 2200,
    image: 'nissan-sunny.jpg',
    details: {
      fuel: 'بنزين',
      transmission: 'أوتوماتيك',
      seats: 5,
      odometer: 36000,
      color: 'فضي'
    }
  }
];

var VALID_GOVERNORATE_CODES = [];
for (var i = 1; i <= 14; i++) {
  VALID_GOVERNORATE_CODES.push(String(i).padStart(2, '0'));
}

var VALID_SYRIAN_MOBILE_PREFIXES = ['93', '94', '95', '96', '98', '99'];

$(document).ready(function () {
  if ($('#vehicleTableBody').length > 0) {
    initVehiclePage();
  }

  if ($('#reservationForm').length > 0) {
    bindReservationForm();
  }
});

function initVehiclePage() {
  renderVehicleTable();
  bindVehicleDetailToggle();
  bindSelectionCheck();
  bindContinueButton();
  bindCloseResultButton();
}

function renderVehicleTable() {
  var html = '';

  $.each(vehicleInventory, function (index, vehicle) {
    html += '<tr data-code="' + vehicle.code + '">';
    html += '<td data-label="اختيار"><input type="checkbox" class="vehicle-select" id="select-' + vehicle.code + '" data-code="' + vehicle.code + '" data-model="' + vehicle.model + '" /></td>';
    html += '<td data-label="إظهار التفاصيل"><input type="checkbox" class="details-toggle" id="details-' + vehicle.code + '" data-code="' + vehicle.code + '" /><label for="details-' + vehicle.code + '">إظهار</label></td>';
    html += '<td data-label="السعر اليومي">' + formatCurrency(vehicle.dailyPrice) + '</td>';
    html += '<td data-label="سنة التصنيع">' + vehicle.year + '</td>';
    html += '<td data-label="الموديل">' + vehicle.model + '</td>';
    html += '<td data-label="رمز السيارة">' + vehicle.code + '</td>';
    html += '<td data-label="الصورة"><img class="vehicle-thumb" src="images/' + vehicle.image + '" alt="' + vehicle.model + '" /></td>';
    html += '</tr>';

    html += '<tr class="detail-row hidden" data-code="' + vehicle.code + '">';
    html += '<td colspan="7"><div class="detail-panel"><div class="detail-grid">';
    html += '<div><strong>نوع الوقود:</strong> ' + vehicle.details.fuel + '</div>';
    html += '<div><strong>نوع الناقل:</strong> ' + vehicle.details.transmission + '</div>';
    html += '<div><strong>عدد المقاعد:</strong> ' + vehicle.details.seats + '</div>';
    html += '<div><strong>عداد الكيلومترات:</strong> ' + formatNumber(vehicle.details.odometer) + ' كم</div>';
    html += '<div><strong>اللون:</strong> ' + vehicle.details.color + '</div>';
    html += '<div><strong>السعر اليومي:</strong> ' + formatCurrency(vehicle.dailyPrice) + '</div>';
    html += '</div></div></td>';
    html += '</tr>';
  });

  $('#vehicleTableBody').html(html);
}

function bindVehicleDetailToggle() {
  $('.details-toggle').on('change', function () {
    var code = $(this).data('code');
    var $detailRow = $('.detail-row[data-code="' + code + '"]');

    if ($(this).is(':checked')) {
      $detailRow.removeClass('hidden');
    } else {
      $detailRow.addClass('hidden');
    }
  });
}

function bindSelectionCheck() {
  $('.vehicle-select').on('change', function () {
    $(this).closest('tr').toggleClass('selected-row', $(this).is(':checked'));
  });
}

function bindContinueButton() {
  $('#continueBtn').on('click', function () {
    var selected = getSelectedVehicles();

    if (selected.length === 0) {
      $('#selectionError').text('يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.');
      $('#selectionError').addClass('visible');
      return;
    }

    $('#selectionError').text('');
    $('#reservationFormContainer').removeClass('hidden');
    $('#reservationFormContainer').show();
    $('html, body').animate({
      scrollTop: $('#reservationFormContainer').offset().top
    }, 500);
  });
}

function getSelectedVehicles() {
  var selectedVehicles = [];

  $('.vehicle-select:checked').each(function () {
    var code = $(this).data('code');
    var selectedVehicle = $.grep(vehicleInventory, function (vehicle) {
      return vehicle.code === code;
    })[0];

    if (selectedVehicle) {
      selectedVehicles.push(selectedVehicle);
    }
  });

  return selectedVehicles;
}

function bindReservationForm() {
  $('#reservationForm').on('submit', function (event) {
    event.preventDefault();

    if (!validateReservationForm()) {
      return;
    }

    var summary = buildReservationSummary();
    displayReservationResult(summary);
  });
}

function bindCloseResultButton() {
  $('#closeResultBtn').on('click', function () {
    $('#resultPanel').removeClass('visible');
  });
}

function validateReservationForm() {
  var isValid = true;
  var fullName = $('#fullName').val().trim();
  var nationalId = $('#nationalId').val().trim();
  var startDate = $('#startDate').val().trim();
  var endDate = $('#endDate').val().trim();
  var mobileNumber = $('#mobileNumber').val().trim();
  var email = $('#email').val().trim();

  clearFieldError('fullName');
  clearFieldError('nationalId');
  clearFieldError('startDate');
  clearFieldError('endDate');
  clearFieldError('mobileNumber');
  clearFieldError('email');

  if (fullName !== '' && !isArabicName(fullName)) {
    setFieldError('fullName', 'يجب أن يحتوي الاسم الكامل على حروف عربية ومسافات فقط.');
    isValid = false;
  }

  if (!isValidNationalId(nationalId)) {
    setFieldError('nationalId', 'الرقم الوطني يجب أن يتكون من 11 رقمًا، ويبدأ برمز محافظة صالح من 01 إلى 14.');
    isValid = false;
  }

  if (!isValidCalendarDate(startDate)) {
    setFieldError('startDate', 'تاريخ بداية التأجير غير صحيح. استخدم الصيغة yyyy-mm-dd.');
    isValid = false;
  }

  if (!isValidCalendarDate(endDate)) {
    setFieldError('endDate', 'تاريخ نهاية التأجير غير صحيح. استخدم الصيغة yyyy-mm-dd.');
    isValid = false;
  }

  if (isValidCalendarDate(startDate) && isValidCalendarDate(endDate)) {
    if (!isEndDateAfterStartDate(startDate, endDate)) {
      setFieldError('endDate', 'يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية بشكل فعلي.');
      isValid = false;
    }
  }

  if (mobileNumber !== '' && !isValidSyrianMobileNumber(mobileNumber)) {
    setFieldError('mobileNumber', 'رقم الموبايل غير صحيح. مثال: 0931234567');
    isValid = false;
  }

  if (email !== '' && !isValidEmail(email)) {
    setFieldError('email', 'البريد الإلكتروني غير صحيح. مثال: user@example.com');
    isValid = false;
  }

  return isValid;
}

function isArabicName(value) {
  return /^[\u0600-\u06FF\s]+$/.test(value);
}

function isValidNationalId(value) {
  if (value === '') {
    return false;
  }

  if (!/^\d{11}$/.test(value)) {
    return false;
  }

  var governorateCode = value.substring(0, 2);
  return $.inArray(governorateCode, VALID_GOVERNORATE_CODES) !== -1;
}

function isValidCalendarDate(value) {
  if (value === '') {
    return false;
  }

  var datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) {
    return false;
  }

  var parts = value.split('-');
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var day = parseInt(parts[2], 10);
  var date = new Date(year, month - 1, day);

  return date.getFullYear() === year && (date.getMonth() + 1) === month && date.getDate() === day;
}

function isEndDateAfterStartDate(startDateText, endDateText) {
  var startDate = parseDateValue(startDateText);
  var endDate = parseDateValue(endDateText);

  return endDate > startDate;
}

function parseDateValue(value) {
  var parts = value.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function isValidSyrianMobileNumber(value) {
  var normalized = value.replace(/\s+/g, '').replace(/\+/g, '');

  if (normalized.length === 10 && /^09\d{8}$/.test(normalized)) {
    var prefix = normalized.substring(1, 3);
    return $.inArray(prefix, VALID_SYRIAN_MOBILE_PREFIXES) !== -1;
  }

  return false;
}

function isValidEmail(value) {
  var pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return pattern.test(value);
}

function buildReservationSummary() {
  var selectedVehicles = getSelectedVehicles();
  var startDateText = $('#startDate').val().trim();
  var endDateText = $('#endDate').val().trim();
  var rentalDays = calculateRentalDays(startDateText, endDateText);

  var subtotal = 0;
  var details = [];

  $.each(selectedVehicles, function (index, vehicle) {
    var singleCost = vehicle.dailyPrice * rentalDays;
    subtotal += singleCost;
    details.push({
      code: vehicle.code,
      model: vehicle.model,
      dailyPrice: vehicle.dailyPrice,
      rentalDays: rentalDays,
      individualCost: singleCost
    });
  });

  var discountRate = rentalDays > 10 ? 0.05 : 0;
  var discountAmount = subtotal * discountRate;
  var finalTotal = subtotal - discountAmount;

  return {
    selectedVehicles: details,
    rentalDays: rentalDays,
    subtotal: subtotal,
    discountRate: discountRate,
    discountAmount: discountAmount,
    finalTotal: finalTotal
  };
}

function calculateRentalDays(startDateText, endDateText) {
  var startDate = parseDateValue(startDateText);
  var endDate = parseDateValue(endDateText);
  var differenceInMilliseconds = endDate - startDate;
  var dayCount = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  return dayCount;
}

function displayReservationResult(summary) {
  var message = '<div class="result-body">';
  message += '<div class="success-message">تمت معالجة الحجز بنجاح. تم حساب الفاتورة بناءً على البيانات المدخلة.</div>';
  message += '<div class="result-summary">';
  message += '<p><strong>مدة التأجير:</strong> ' + summary.rentalDays + ' يوم</p>';
  message += '<p><strong>إجمالي المبلغ قبل الخصم:</strong> ' + formatCurrency(summary.subtotal) + '</p>';
  message += '<p><strong>نسبة الخصم:</strong> ' + (summary.discountRate * 100) + '%</p>';
  message += '<p><strong>قيمة الخصم:</strong> ' + formatCurrency(summary.discountAmount) + '</p>';
  message += '<p><strong>المبلغ النهائي:</strong> ' + formatCurrency(summary.finalTotal) + '</p>';
  message += '</div>';
  message += '<table class="result-table"><thead><tr><th>رمز السيارة</th><th>الموديل</th><th>السعر اليومي</th><th>أيام التأجير</th><th>إجمالي السيارة</th></tr></thead><tbody>';

  $.each(summary.selectedVehicles, function (index, item) {
    message += '<tr>';
    message += '<td data-label="رمز السيارة">' + item.code + '</td>';
    message += '<td data-label="الموديل">' + item.model + '</td>';
    message += '<td data-label="السعر اليومي">' + formatCurrency(item.dailyPrice) + '</td>';
    message += '<td data-label="أيام التأجير">' + item.rentalDays + '</td>';
    message += '<td data-label="إجمالي السيارة">' + formatCurrency(item.individualCost) + '</td>';
    message += '</tr>';
  });

  message += '</tbody></table>';
  message += '</div>';

  $('#resultContent').html(message);
  $('#resultPanel').addClass('visible');
  $('#resultPanel').scrollTop(0);
}

function formatCurrency(value) {
  return 'ل.س ' + formatNumber(value);
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function setFieldError(fieldId, message) {
  var input = $('#' + fieldId);
  input.addClass('input-error');
  $('#' + fieldId + 'Error').text(message);
}

function clearFieldError(fieldId) {
  var input = $('#' + fieldId);
  input.removeClass('input-error');
  $('#' + fieldId + 'Error').text('');
}
