from django.contrib import admin
from django.utils.html import format_html
from .models import Address, Master, Social, GalleryImage, Review, Service, ServiceSubsection, PriceItem

## Вложенный (inline) интерфейс для Social внутри страницы Master
## позволяет редактировать соцссылки прямо при редактировании мастера
class SocialInline(admin.TabularInline):
    model = Social
    extra = 1  # сколько пустых форм добавлять
    fields = ('href', 'icon', 'color', 'sort_order', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('sort_order',)

@admin.register(Master)
class MasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'photo_preview', 'name', 'specialty', 'created_at', 'updated_at')
    search_fields = ('name', 'specialty', 'description')
    list_filter = ('specialty', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = (SocialInline,)

    def photo_preview(self, obj):
        if not obj.photo:
            return '(нет фото)'
        return format_html(
            '<img src="{}" style="max-height:60px; max-width:120px; object-fit:cover; border-radius:4px;" />',
            obj.photo.url
        )
    photo_preview.short_description = 'Фото'
    photo_preview.allow_tags = True

@admin.register(Social)
class SocialAdmin(admin.ModelAdmin):
    list_display = ('id', 'master', 'href', 'icon', 'color_display', 'sort_order', 'created_at')
    search_fields = ('href', 'master__name')
    list_filter = ('master',)
    ordering = ('sort_order',)
    readonly_fields = ('created_at',)

    def color_display(self, obj):
        if not obj.color:
            return '(нет)'
        return format_html(
            '<span style="display:inline-block; width:36px; height:18px; border:1px solid #ccc; background:{};"></span> {}',
            obj.color, obj.color
        )
    color_display.short_description = 'Цвет'

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'image')

@admin.register(Address)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'email', 'phone', 'opening_hours', 'latitude', 'longitude', 'created_at', 'updated_at')
    readonly_fields = ('created_at',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'rating', 'is_public', 'created_at')
    list_filter = ('is_public', 'rating', 'created_at')
    search_fields = ('name', 'email', 'review')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)

# Для раздела Услуги
class ServiceSubsectionInline(admin.TabularInline):
    model = ServiceSubsection
    extra = 1 # Количество пустых форм для добавления новых подразделов

class PriceItemInline(admin.TabularInline):
    model = PriceItem
    extra = 1

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'has_subsections')
    inlines = [ServiceSubsectionInline] # Позволяет добавлять подразделы прямо из формы услуги

@admin.register(ServiceSubsection)
class ServiceSubsectionAdmin(admin.ModelAdmin):
    list_display = ('service', 'name', 'description')
    list_filter = ('service',)
    search_fields = ('name', 'service__name')
    inlines = [PriceItemInline] # Позволяет добавлять прайсы прямо из формы подраздела

@admin.register(PriceItem)
class PriceItemAdmin(admin.ModelAdmin):
    list_display = ('operation_name', 'price', 'service', 'subsection', 'duration_minutes')
    list_filter = ('service', 'subsection')
    search_fields = ('operation_name', 'service__name', 'subsection__name')
    # Чтобы в админке было понятно, какой FK активен
    fieldsets = (
        (None, {
            'fields': ('operation_name', 'price', 'duration_minutes'),
        }),
        ('Привязка к услуге/подразделу', {
            'fields': ('service', 'subsection'),
            'description': 'Выберите либо услугу, либо подраздел, но не оба.',
        }),
    )
