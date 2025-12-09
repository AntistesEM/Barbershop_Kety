from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.contrib import messages
from .models import Address, GalleryImage, Master, PriceItem, Review, Service, ServiceSubsection
from .serializers import AddressSerializer, MasterSerializer, ServiceSerializer


def get_common_context():
    
    """
    Функция для сбора общего контекста для страниц index.html

    Возвращает контекст в виде словаря с ключами:
    - masters: все мастера
    - images: первые 20 изображений из галереи
    - reviews: последние 20 публичных отзывов
    - services: все услуги
    - address: контактные данные (адрес, телефон, email, ...)
    """

    # masters_data: все мастера
    masters_queryset = Master.objects.prefetch_related('socials').all()
    master_serializer = MasterSerializer(masters_queryset, many=True, context={'request': None})
    masters_data = master_serializer.data

    # images: все изображения галереи (с ограничением для производительности)
    images = GalleryImage.objects.all()[:20]  # например, первые 20

    # reviews: показываем только публичные и последние (например 20)
    reviews = Review.objects.filter(is_public=True).order_by('-created_at')[:20]

    # Получаем все услуги. ОЧЕНЬ ВАЖНО использовать prefetch_related для оптимизации запросов и избегания проблемы N+1.
    # 'subsections__price_items' - для прайсов, привязанных к подразделам
    # 'price_items' - для прайсов, привязанных напрямую к услуге
    services_queryset = Service.objects.all().prefetch_related(
        'subsections__price_items',
        'price_items'
    )
    service_serializer = ServiceSerializer(services_queryset, many=True)
    services_data = service_serializer.data

    # Контакты для раздела "Контакты" и карты
    address_queryset = Address.objects.first()
    address_serializer = AddressSerializer(address_queryset)
    address_data = address_serializer.data

    # Собираем контекст в словарь
    context = {
        'masters': masters_data,
        'images': images,
        'reviews': reviews,
        'services': services_data,
        'address': address_data
    }

    return context

def index(request):
    
    """
    Возвращает главную страницу index.html с контекстом, полученным из функции get_common_context.
    """
    context = get_common_context()

    return render(request, 'landing/index.html', context)

def reviews_create(request):

    """
    Создаём новый отзыв из формы и отправляем его на сервер.
    Если это AJAX-запрос — возвращаем JSON с информацией о созданном отзыве.
    Если это не AJAX-запрос — возвращаем классический PRG с сообщением об успехе или ошибке.
    """
    if request.method == "POST":
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        review = request.POST.get('review', '').strip()
        try:
            rating = int(request.POST.get('rating', 0))
        except (TypeError, ValueError):
            rating = 0

        is_valid = bool(name and review and 1 <= rating <= 5)

        if is_valid:
            # создаём запись в БД
            rev = Review.objects.create(
                name=name,
                email=email,
                review=review,
                rating=rating,
            )

            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({
                    "success": True,
                    "review": {
                        "id": rev.id,
                        "name": rev.name,
                        "review": rev.review,
                        "rating": rev.rating,
                        "created_at": rev.created_at.isoformat(),
                    }
                })
            
            messages.success(request, "Спасибо! Отзыв отправлен.")
            return redirect('reviews:create')
        else:
            error_msg = "Проверьте поля и оценку"
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({"success": False, "error": error_msg}, status=400)
            messages.error(request, error_msg)

    return render(request, "landing/reviews.html")
