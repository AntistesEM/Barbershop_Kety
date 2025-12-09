from rest_framework import serializers
from .models import Address, Master, PriceItem, Review, Service, ServiceSubsection, Social

class AddressSerializer(serializers.ModelSerializer):
    # Добавляем поле для форматированного номера
    formatted_phone_number = serializers.SerializerMethodField()

    class Meta:
        model = Address
        fields = ('name', 'address', 'email', 'phone', 'opening_hours', 'latitude', 'longitude', 'formatted_phone_number')

    # Этот метод будет вызван для получения значения formatted_phone_number
    def get_formatted_phone_number(self, obj):
        return obj.formatted_phone_number() # Вызываем метод модели

class SocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Social
        fields = ('href', 'icon', 'color')

class MasterSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(use_url=True)  # отдаёт URL
    socials = SocialSerializer(many=True, read_only=True)  # related_name='socials'

    class Meta:
        model = Master
        fields = ('name', 'photo', 'specialty', 'description', 'socials')

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'name', 'email', 'review', 'rating', 'is_public', 'created_at']
        read_only_fields = ['id', 'created_at']

    # Общая валидация: можно запретить пустой отзыв
    def validate(self, attrs):
        # attrs содержит данные перед созданием/обновлением
        review_text = attrs.get('review')
        if review_text and len(review_text.strip()) == 0:
            raise serializers.ValidationError({"review": "Отзыв не может быть пустым."})
        return attrs

class PriceItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор для отдельной позиции прайса.
    Используется как вложенный для Service и ServiceSubsection.
    """
    class Meta:
        model = PriceItem
        fields = ['id', 'operation_name', 'price', 'duration_minutes']
        # 'service' и 'subsection' не включаем, так как они будут подразумеваться родительским объектом, к которому привязан PriceItem.

class ServiceSubsectionSerializer(serializers.ModelSerializer):
    """
    Сериализатор для подраздела услуги.
    Включает в себя прайс-лист для этого подраздела.
    """
    price_items = PriceItemSerializer(many=True, read_only=True)
    # 'read_only=True' означает, что эти вложенные объекты не будут создаваться/обновляться через этот сериализатор.
    title_image = serializers.ImageField(read_only=True)

    class Meta:
        model = ServiceSubsection
        fields = ['id', 'name', 'description', 'price_items', 'title_image']


class ServiceSerializer(serializers.ModelSerializer):
    """
    Основной сериализатор для услуги.
    Включает подразделы и/или прямые позиции прайса.
    """
    # Сериализатор для подразделов услуги (если они есть)
    subsections = ServiceSubsectionSerializer(many=True, read_only=True)
    # Поле, показывающее, есть ли у услуги подразделы (из метода модели)
    has_subsections = serializers.BooleanField(read_only=True)
    title_image = serializers.ImageField(read_only=True)
    # Используем SerializerMethodField для динамического получения прайс-листа в зависимости от наличия подразделов.
    price_list = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'has_subsections', 'subsections', 'price_list', 'title_image']

    def get_price_list(self, obj):
        """
        Возвращает прайс-лист, используя логику, определенную в модели Service.
        """
        # obj - это экземпляр Service
        if obj.has_subsections():
            # Если есть подразделы, возвращаем прайсы, сгруппированные по подразделам
            price_data = {}
            for subsection in obj.subsections.all():
                # Используем ServiceSubsectionSerializer, но только для price_items, чтобы получить id, operation_name, price, duration_minutes
                price_data[subsection.name] = PriceItemSerializer(subsection.price_items.all(), many=True).data
            return price_data
        else:
            # Если подразделов нет, возвращаем прайс, привязанный напрямую к услуге
            return PriceItemSerializer(obj.price_items.all(), many=True).data
