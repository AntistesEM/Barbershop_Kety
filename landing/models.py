import re
from django.db import models
from django.db.models import Q
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

ICON_CHOICES = [
    ('fa-brands fa-twitter', 'Twitter'),
    ('fa-brands fa-square-odnoklassniki', 'Одноклассники'),
    ('fa-brands fa-vk', 'ВКонтакте'),
    ('fa-brands fa-telegram', 'Telegram'),
    ('fa-solid fa-phone', 'Телефон'),
]

COLOR_CHOICES = [
    ('#1da1f2', 'Twitter'),
    ('#ed812b', 'Одноклассники'),
    ('#45668e', 'ВКонтакте'),
    ('#229ED9', 'Telegram'),
    ('#00ff00', 'Телефон'),
]

HEX_COLOR_RE = re.compile(r'^#([0-9a-fA-F]{6})$')

def validate_hex_color(value):
    """
    Валидатор для проверки цвета в формате #rrggbb
    """
    if value == '':
        return
    if not HEX_COLOR_RE.match(value):
        raise ValidationError('Цвет должен быть в формате #rrggbb, например #1a2b3c')

class Address(models.Model):
    """ Модель контактов """
    name = models.CharField(max_length=100, verbose_name="Название организации")
    address = models.CharField(max_length=1024, verbose_name="Физический адрес")
    email = models.EmailField(max_length=254, blank=True, verbose_name="Email")
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        verbose_name="Телефон",
        help_text="Формат: +71234567890"
    )
    opening_hours = models.CharField(
        max_length=1024,
        blank=True,
        verbose_name="Часы работы",
        help_text="Например: Пн-Пт: 9:00 - 20:00; Сб-Вс: 10:00 - 18:00"
    )
    latitude = models.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
        verbose_name="Широта"
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
        verbose_name="Долгота"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Адрес"
        verbose_name_plural = "Адреса"

    def __str__(self):
        return self.name
    
    def formatted_phone_number(self):
        # Форматируем номер телефона в формат: "+7 (912) 345-67-89"
        if len(self.phone) == 12 and self.phone.startswith('+7'):
            return f"+7 ({self.phone[2:5]}) {self.phone[5:8]}-{self.phone[8:]}"
        return self.phone  # Возвращаем исходный номер, если формат не подходит


class Master(models.Model):
    """ Модель мастера """
    name = models.CharField(max_length=100, verbose_name="Имя")
    photo = models.ImageField(upload_to='photos/', verbose_name="Фотография")
    specialty = models.CharField(max_length=200, blank=True, verbose_name="Специализация")
    description = models.TextField(blank=True, verbose_name="Описание")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Мастер"
        verbose_name_plural = "Мастера"

    def __str__(self):
        return self.name

class Social(models.Model):
    """ Модель социальных сетей """
    master = models.ForeignKey(Master, related_name='socials', on_delete=models.CASCADE, verbose_name="Мастер")
    href = models.CharField(max_length=1024, verbose_name="Ссылка")
    icon = models.CharField(max_length=200, choices=ICON_CHOICES, blank=True, verbose_name="Класс иконки")  # например "fa-brands fa-vk"
    color = models.CharField(max_length=7, choices=COLOR_CHOICES, blank=True, validators=[validate_hex_color], verbose_name="Цвет иконки")  # формат #rrggbb
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Социальная сеть"
        verbose_name_plural = "Социальные сети"
        ordering = ['sort_order']
        indexes = [
            models.Index(fields=['master']),
            models.Index(fields=['href']),
        ]

    def __str__(self):
        return f"{self.master.name} — {self.href}"

class GalleryImage(models.Model):
    """ Модель изображения в галерее """
    title = models.CharField(max_length=100, verbose_name="Заголовок изображения")
    image = models.ImageField(upload_to='gallery_images/', verbose_name="Изображение")

    class Meta:
        verbose_name = "Изображение в галерее"
        verbose_name_plural = "Изображения в галерее"

    def __str__(self):
        return self.title
    
class Review(models.Model):
    """ Модель отзыва """
    name = models.CharField(max_length=100, verbose_name="Имя автора")
    email = models.EmailField(max_length=254, blank=True, unique=True, verbose_name="Email")
    review = models.TextField(verbose_name="Отзыв")
    # Оценка 1..5
    rating = models.PositiveSmallIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Оценка"
    )
    # Поле "публичный/опубликован" — чтобы можно было фильтровать опубликованные отзывы
    is_public = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def str(self):
        return f"{self.name} ({self.created_at:%Y-%m-%d %H:%M})"

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        # Сортировка по убыванию времени создания (последние сверху).
        ordering = ['-created_at']

        # Индексы для ускорения запросов по полям created_at и is_public.
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['is_public']),
        ]

# Модели для секции Услуги
class Service(models.Model):
    """
    Модель для основной услуги (например, 'Парикмахерские услуги', 'Ногтевой сервис').
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Название услуги")
    description = models.TextField(blank=True, null=True, verbose_name="Описание услуги")
    title_image = models.ImageField(
        upload_to='service_covers/',
        blank=True,
        null=True,
        verbose_name="Обложка услуги"
    )

    class Meta:
        verbose_name = "Услуга"
        verbose_name_plural = "Услуги"
        ordering = ['name']

    def __str__(self):
        return self.name

    def has_subsections(self):
        """
        Проверяет, есть ли у данной услуги подразделы.
        """
        return self.subsections.exists()

    def get_price_list(self):
        """
        Возвращает прайс-лист для услуги.
        Если есть подразделы, то возвращает прайсы подразделов.
        Если нет подразделов, то возвращает прайсы, привязанные напрямую к услуге.
        """
        if self.has_subsections():
            # Если есть подразделы, собираем прайсы со всех подразделов
            price_data = {}
            for subsection in self.subsections.all():
                price_data[subsection.name] = list(subsection.price_items.all().values('operation_name', 'price'))
            return price_data
        else:
            # Если нет подразделов, возвращаем прайс, привязанный напрямую к услуге
            return list(self.price_items.all().values('operation_name', 'price'))


class ServiceSubsection(models.Model):
    """
    Модель для подраздела услуги (например, 'Женский зал' для 'Парикмахерских услуг').
    """
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='subsections',
        verbose_name="Услуга"
    )
    name = models.CharField(max_length=255, verbose_name="Название подраздела")
    description = models.TextField(blank=True, null=True, verbose_name="Описание подраздела")
    title_image = models.ImageField(
        upload_to='subsection_covers/',
        blank=True,
        null=True,
        verbose_name="Обложка подраздела"
    )

    class Meta:
        unique_together = ('service', 'name') # Подразделы одной услуги должны иметь уникальные имена
        verbose_name = "Подраздел услуги"
        verbose_name_plural = "Подразделы услуг"
        ordering = ['service__name', 'name']

    def __str__(self):
        return f"{self.service.name} - {self.name}"

    def get_price_list(self):
        """
        Возвращает прайс-лист для данного подраздела.
        """
        return list(self.price_items.all().values('operation_name', 'price'))


class PriceItem(models.Model):
    """
    Модель для отдельной позиции прайса (операция и цена).
    Привязывается либо к Service, либо к ServiceSubsection, но не к обоим одновременно.
    """
    operation_name = models.CharField(max_length=255, verbose_name="Операция")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    duration_minutes = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Примерное время (мин)"
    )

    # Внешние ключи. Один из них ДОЛЖЕН быть установлен, другой ДОЛЖЕН быть NULL.
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='price_items', # Прайсы, привязанные напрямую к услуге
        verbose_name="Услуга (если без подраздела)"
    )
    subsection = models.ForeignKey(
        ServiceSubsection,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='price_items', # Прайсы, привязанные к подразделу
        verbose_name="Подраздел услуги"
    )

    class Meta:
        verbose_name = "Позиция прайса"
        verbose_name_plural = "Позиции прайса"
        ordering = ['operation_name']

    def clean(self):
        """
        Пользовательская валидация для PriceItem:
        - Гарантирует, что привязка происходит либо к услуге, либо к подразделу, но не к обоим.
        - Гарантирует уникальность operation_name в рамках привязанной услуги/подраздела.
        """
        # Проверка, что установлен ровно один внешний ключ
        if self.service and self.subsection:
            raise ValidationError("Позиция прайса не может быть привязана одновременно к услуге и к подразделу.")
        if not self.service and not self.subsection:
            raise ValidationError("Позиция прайса должна быть привязана либо к услуге, либо к подразделу.")

        # Проверка на уникальность operation_name для услуги или подраздела
        query_filter = Q()
        if self.service:
            query_filter = Q(service=self.service)
        elif self.subsection:
            query_filter = Q(subsection=self.subsection)

        # Ищем существующие позиции с тем же operation_name и владельцем
        existing_items = PriceItem.objects.filter(
            query_filter,
            operation_name__iexact=self.operation_name # Регистронезависимая проверка
        )

        if self.pk: # Если это редактирование существующего объекта, исключаем его из проверки
            existing_items = existing_items.exclude(pk=self.pk)

        if existing_items.exists():
            owner_type = "услуги" if self.service else "подраздела"
            raise ValidationError(
                f"Операция '{self.operation_name}' уже существует для данной {owner_type}."
            )

    def save(self, *args, **kwargs):
        self.full_clean() # Вызываем full_clean() перед сохранением для запуска валидации
        super().save(*args, **kwargs)

    def __str__(self):
        owner_name = ""
        if self.service:
            owner_name = f"Услуга: {self.service.name}"
        elif self.subsection:
            owner_name = f"Подраздел: {self.subsection.name}"
        return f"{self.operation_name} ({self.price} руб.) - {owner_name}"

# первый вариант:    
# class Master(models.Model):
#     name = models.CharField(max_length=100)
#     photo = models.ImageField(upload_to='photos/')
#     description = models.TextField()
#     phone_number = models.CharField(max_length=20)
#     def __str__(self):
#         return self.name
#     def formatted_phone_number(self):
#         # Форматируем номер телефона в формат: "+7 (912) 345-67-89"
#         if len(self.phone_number) == 12 and self.phone_number.startswith('+7'):
#             return f"+7 ({self.phone_number[2:5]}) {self.phone_number[5:8]}-{self.phone_number[8:]}"
#         return self.phone_number  # Возвращаем исходный номер, если формат не подходит