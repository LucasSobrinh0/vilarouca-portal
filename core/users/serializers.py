from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import CustomUser, Company

class UserSerializer(serializers.ModelSerializer):
    # Permite associar várias empresas ao usuário (ManyToMany)
    companies = serializers.PrimaryKeyRelatedField(
        many=True,  # Pode receber múltiplas empresas
        queryset=Company.objects.all(),  # De onde buscar essas empresas
        required=False  # Campo opcional
    )

    class Meta:
        model = CustomUser  # Define o modelo a ser serializado
        fields = ['id', 'username', 'password', 'role', 'companies']  # Campos que serão expostos na API
        extra_kwargs = {'password': {'write_only': True}}  # Senha só pode ser enviada, não retornada

    def create(self, validated_data):
        # Extrai e remove a senha dos dados validados
        password = validated_data.pop('password')
        # Extrai empresas se tiverem sido enviadas (pode ser vazio)
        companies = validated_data.pop('companies', [])
        # Cria o usuário sem senha (ainda não criptografada)
        user = CustomUser.objects.create(**validated_data)
        # Criptografa a senha
        user.password = make_password(password)
        user.save()
        # Associa empresas ao usuário
        user.companies.set(companies)
        return user

    def update(self, instance, validated_data):
        # Se uma nova senha for enviada, criptografa e atualiza
        password = validated_data.pop('password', None)
        companies = validated_data.pop('companies', None)

        if password:
            instance.password = make_password(password)

        # Atualiza as empresas associadas
        if companies:
            instance.companies.set(companies)

        # Atualiza os demais campos
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
