from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import CustomUser, Company

class UserSerializer(serializers.ModelSerializer):
    companies = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Company.objects.all(),
        required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'role', 'companies']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        companies = validated_data.pop('companies', [])
        user = CustomUser.objects.create(**validated_data)
        user.password = make_password(password)
        user.save()
        user.companies.set(companies)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        companies = validated_data.pop('companies', None)
        if password:
            instance.password = make_password(password)
        
        if companies:
            instance.companies.set(companies)   

        return super().update(instance, validated_data)

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'cnpj']


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Adiciona informações extras sobre o usuário
        data['role'] = self.user.role  # <- Certifique-se que o campo "role" existe no seu model de usuário
        data['username'] = self.user.username

        return data
